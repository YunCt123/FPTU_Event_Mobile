import { NativeModules } from "react-native";
import Constants from "expo-constants";
import { api } from "../api/api";
import { NOTIFICATION_ENDPOINTS } from "../constants/apiEndpoints";

// OneSignal App ID từ env
const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || "";

// Check if OneSignal native module is available
const isOneSignalAvailable = (): boolean => {
  try {
    // Check if running in Expo Go
    if (Constants.appOwnership === "expo") {
      return false;
    }
    // Check if native module exists
    const hasNativeModule =
      NativeModules.OneSignal || NativeModules.RNOneSignal;
    return !!hasNativeModule;
  } catch {
    return false;
  }
};

// Helper để lấy OneSignal (chỉ khi available)
const getOneSignal = (): any => {
  if (!isOneSignalAvailable()) {
    return null;
  }
  try {
    const { OneSignal } = require("react-native-onesignal");
    return OneSignal;
  } catch {
    return null;
  }
};

class NotificationService {
  private isInitialized = false;

  /**
   * Khởi tạo OneSignal SDK
   * Gọi 1 lần khi app start
   */
  initialize(): void {
    if (this.isInitialized || !ONESIGNAL_APP_ID) {
      if (!ONESIGNAL_APP_ID) {
        console.log("OneSignal: App ID not configured");
      }
      return;
    }

    const OneSignal = getOneSignal();
    if (!OneSignal) {
      console.log("OneSignal: Not available in Expo Go");
      return;
    }

    try {
      // Khởi tạo OneSignal
      OneSignal.initialize(ONESIGNAL_APP_ID);

      // Debug mode (tắt khi production)
      OneSignal.Debug.setLogLevel(6);

      this.isInitialized = true;
      console.log("OneSignal initialized successfully");
    } catch (error) {
      console.error("Failed to initialize OneSignal:", error);
    }
  }

  /**
   * Yêu cầu quyền push notification
   */
  async requestPermission(): Promise<boolean> {
    const OneSignal = getOneSignal();
    if (!OneSignal) return false;

    try {
      const granted = await OneSignal.Notifications.requestPermission(true);
      console.log("Push notification permission:", granted);
      return granted;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }

  /**
   * Lấy subscription ID của user
   */
  getSubscriptionId(): string | null {
    const OneSignal = getOneSignal();
    if (!OneSignal) return null;

    try {
      const subscriptionId =
        OneSignal.User.pushSubscription.getPushSubscriptionId();
      return subscriptionId || null;
    } catch (error) {
      console.error("Failed to get subscription ID:", error);
      return null;
    }
  }

  /**
   * Đăng ký subscription với backend
   * Backend sẽ lưu để gửi notification đích danh
   */
  async registerSubscription(deviceId?: string): Promise<void> {
    const subscriptionId = this.getSubscriptionId();
    if (!subscriptionId) {
      console.log("No subscription ID available (Expo Go mode)");
      return;
    }

    try {
      await api.post(NOTIFICATION_ENDPOINTS.SUBSCRIPTIONS, {
        subscriptionId,
        deviceId: deviceId || undefined,
      });

      console.log("Subscription registered with backend");
    } catch (error) {
      console.error("Failed to register subscription:", error);
    }
  }

  /**
   * Setup notification opened handler
   * Dùng để điều hướng đến màn hình sự kiện khi user tap vào notification
   */
  setNotificationOpenedHandler(
    handler: (eventId: string, type: string) => void
  ): void {
    const OneSignal = getOneSignal();
    if (!OneSignal) return;

    try {
      OneSignal.Notifications.addEventListener("click", (event: any) => {
        const data = event.notification.additionalData as {
          eventId?: string;
          type?: string;
        } | null;

        if (data?.eventId) {
          handler(data.eventId, data.type || "");
        }
      });
    } catch (error) {
      console.error("Failed to setup notification handler:", error);
    }
  }

  /**
   * Setup notification received handler (foreground)
   */
  setNotificationReceivedHandler(
    handler: (title: string, body: string, data: any) => void
  ): void {
    const OneSignal = getOneSignal();
    if (!OneSignal) return;

    try {
      OneSignal.Notifications.addEventListener(
        "foregroundWillDisplay",
        (event: any) => {
          const notification = event.getNotification();
          handler(
            notification.title || "",
            notification.body || "",
            notification.additionalData
          );

          // Hiển thị notification
          event.preventDefault();
          event.getNotification().display();
        }
      );
    } catch (error) {
      console.error("Failed to setup notification received handler:", error);
    }
  }

  /**
   * Kiểm tra trạng thái permission
   */
  hasPermission(): boolean {
    const OneSignal = getOneSignal();
    if (!OneSignal) return false;

    try {
      return OneSignal.Notifications.hasPermission();
    } catch {
      return false;
    }
  }
}

export const notificationService = new NotificationService();
