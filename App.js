import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, NativeModules } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Constants from "expo-constants";
import RootNavigator from "./src/navigation/RootNavigator";

// OneSignal App ID
const ONESIGNAL_APP_ID =
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ||
  Constants.expoConfig?.extra?.oneSignalAppId ||
  "";

// Check if OneSignal native module is available
const isOneSignalAvailable = () => {
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

export default function App() {
  useEffect(() => {
    // Khởi tạo OneSignal (chỉ khi có native module)
    const initOneSignal = async () => {
      if (!ONESIGNAL_APP_ID) {
        console.log(
          "OneSignal: App ID not configured, skipping initialization"
        );
        return;
      }

      if (!isOneSignalAvailable()) {
        console.log(
          "OneSignal: Not available in Expo Go, skipping initialization"
        );
        return;
      }

      try {
        const { LogLevel, OneSignal } = require("react-native-onesignal");

        // Debug log (tắt ở production)
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);

        // Khởi tạo với App ID
        OneSignal.initialize(ONESIGNAL_APP_ID);

        // Yêu cầu quyền push notification
        OneSignal.Notifications.requestPermission(true);

        console.log("OneSignal initialized with App ID:", ONESIGNAL_APP_ID);
      } catch (error) {
        console.log("OneSignal: Failed to initialize -", error.message);
      }
    };

    initOneSignal();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
