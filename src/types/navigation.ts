import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type RootStackParamList = {
    // Auth Screens
    AuthLanding: undefined;
    Register: undefined;
    Login: undefined;

    // Main App (Bottom Tabs)
    MainTabs: undefined;

    // Event Screens
    EventList: undefined;
    EventDetails: { eventId: string };
    MyEvents: undefined;

    // Profile Screens
    Profile: undefined;
    EditProfile: undefined;
};

export type AuthStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Event: undefined;
  Ticket: undefined;
  Profile: undefined;
};


export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;