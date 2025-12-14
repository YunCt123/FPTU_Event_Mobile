import React, { useEffect, useState, useRef } from "react";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { STORAGE_KEYS } from "../api/api";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PersonalInfoScreen from "../screens/profile/PersonalInfoScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";
import EventDetailScreen from "../screens/event/EventDetailScreen";
import TicketScreen from "../screens/ticket/TicketScreen";
import TicketDetailScreen from "../screens/ticket/TicketDetailScreen";
import TicketQRCodeScreen from "../screens/ticket/TicketQRCodeScreen";
import TicketHistoryScreen from "../screens/ticket/TicketHistoryScreen";
import StaffAssignedEventsScreen from "../screens/staff/StaffAssignedEventsScreen";
import IncidentReportScreen from "../screens/staff/IncidentReportScreen";
import IncidentHistoryScreen from "../screens/staff/IncidentHistoryScreen";
import { RootStackParamList } from "../types/navigation";
import TicketScanScreen from "../screens/staff/TicketScanScreen";

export type { RootStackParamList };

// Check if OneSignal native module is available
const isOneSignalAvailable = (): boolean => {
  try {
    if (Constants.appOwnership === "expo") {
      return false;
    }
    const hasNativeModule =
      NativeModules.OneSignal || NativeModules.RNOneSignal;
    return !!hasNativeModule;
  } catch {
    return false;
  }
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | null
  >(null);
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        setInitialRoute(token ? "Main" : "Auth");
      } catch {
        setInitialRoute("Auth");
      }
    };

    checkAuth();
  }, []);

  // Setup OneSignal notification handlers (chỉ khi có native module)
  useEffect(() => {
    if (!isOneSignalAvailable()) {
      console.log(
        "OneSignal: Not available in Expo Go, skipping notification handlers"
      );
      return;
    }

    try {
      const { OneSignal } = require("react-native-onesignal");

      // Xử lý khi user tap vào notification
      const handleNotificationClick = (event: any) => {
        const data = event.notification.additionalData as {
          eventId?: string;
          type?: string;
        } | null;

        if (data?.eventId && navigationRef.current) {
          // Điều hướng đến màn hình chi tiết sự kiện
          navigationRef.current.navigate("EventDetails", {
            eventId: data.eventId,
          });
        }
      };

      OneSignal.Notifications.addEventListener(
        "click",
        handleNotificationClick
      );

      return () => {
        OneSignal.Notifications.removeEventListener(
          "click",
          handleNotificationClick
        );
      };
    } catch (error) {
      console.log("OneSignal: Failed to setup handlers");
    }
  }, []);

  if (!initialRoute) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        id="RootStack"
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailScreen} />
        <Stack.Screen name="Ticket" component={TicketScreen} />
        <Stack.Screen name="TicketDetails" component={TicketDetailScreen} />
        <Stack.Screen name="TicketQRCode" component={TicketQRCodeScreen} />
        <Stack.Screen name="TicketHistory" component={TicketHistoryScreen} />

        {/* Staff Screens */}
        <Stack.Screen
          name="StaffAssignedEvents"
          component={StaffAssignedEventsScreen}
        />
        <Stack.Screen name="StaffEventDetail" component={EventDetailScreen} />
        <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
        <Stack.Screen
          name="IncidentHistory"
          component={IncidentHistoryScreen}
        />
        <Stack.Screen name="StaffScan" component={TicketScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
