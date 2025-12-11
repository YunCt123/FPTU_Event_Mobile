import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { STORAGE_KEYS } from "../api/api";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PersonalInfoScreen from "../screens/profile/PersonalInfoScreen";
import EventDetailScreen from "../screens/event/EventDetailScreen";
import TicketDetailScreen from "../screens/ticket/TicketDetailScreen";
import TicketQRCodeScreen from "../screens/ticket/TicketQRCodeScreen";
import StaffAssignedEventsScreen from "../screens/staff/StaffAssignedEventsScreen";
import ScanQRCodeScreen from "../screens/staff/ScanQRCodeScreen";
import ManualCheckInScreen from "../screens/staff/ManualCheckInScreen";
import IncidentReportScreen from "../screens/staff/IncidentReportScreen";
import { RootStackParamList } from "../types/navigation";

export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | null
  >(null);

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

  if (!initialRoute) {
    return null;
  }

  return (
    <NavigationContainer>
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
        <Stack.Screen name="EventDetails" component={EventDetailScreen} />
        <Stack.Screen name="TicketDetails" component={TicketDetailScreen} />
        <Stack.Screen name="TicketQRCode" component={TicketQRCodeScreen} />
        
        {/* Staff Screens */}
        <Stack.Screen name="StaffAssignedEvents" component={StaffAssignedEventsScreen} />
        <Stack.Screen name="ScanQRCode" component={ScanQRCodeScreen} />
        <Stack.Screen name="ManualCheckIn" component={ManualCheckInScreen} />
        <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
