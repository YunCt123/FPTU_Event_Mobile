import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RegisterRequest } from "./auth";

export type RootStackParamList = {
  // Auth Screens
  Auth: undefined;
  AuthLanding: undefined;
  Register: undefined;
  Login: undefined;

  // Main App (Bottom Tabs)
  Main: undefined;
  MainTabs: undefined;

  // Event Screens
  EventList: undefined;
  EventDetails: { eventId: string };
  MyEvents: undefined;

    // Ticket Screens
    TicketDetails: { ticketId: string };
    TicketQRCode: { ticketId: string };
    TicketHistory: undefined;

  // Profile Screens
  Profile: undefined;
  EditProfile: undefined;
  PersonalInfo: undefined;

    // Staff Screens
    StaffAssignedEvents: undefined;
    StaffEventDetail: { eventId: string };
    IncidentReport: { eventId: string; eventTitle?: string };
    IncidentHistory: undefined;
    StaffScan: { eventId: string; eventTitle?: string };
};

export type AuthStackParamList = {
  AuthLanding: { registerMessage?: string } | undefined;
  Login: undefined;
  Register: undefined;
  RegisterAdditional: {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gender: boolean;
    phoneNumber: string;
    requireStudentCard: boolean;
  };
  RegisterStudentCard: {
    basePayload: Omit<RegisterRequest, "studentCardImage">;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Event: undefined;
  Ticket: undefined;
};

export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
