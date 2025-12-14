type ApiConfig = {
  BASE_URL: string;
  TIMEOUT: number;
};

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL,
  TIMEOUT: 30000, // 30 seconds
  VERSION: "v1",
};

export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  REFRESH: "/auth/refresh",
  GOOGLE: "auth/google",
  GOOGLE_CALLBACK: "auth/google/callback",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_OTP: "/auth/verify-otp",
  RESET_PASSWORD: "/auth/reset-password",
  CHANGE_PASSWORD: "/auth/change-password",
};

export const USER_ENDPOINTS = {
  ME: "/users/me",
  UPDATE_ME: "/users/me",
};

export const CAMPUS_ENDPOINTS = {
  LIST: "/campus",
};

export const EVENT_ENDPOINTS = {
  LIST: "/events",
};

export const TICKET_ENDPOINTS = {
  REGISTER: "/tickets",
  GET: "/seat",
  LIST: "/tickets/me",
  CREATE: "/tickets",
  BY_ID: (id: string) => `/tickets/${id}`,
  BY_QR: (qrCode: string) => `/tickets/qr/${qrCode}`,
  SCAN: "/tickets/scan",
  MANUAL_CHECKIN: "/tickets/manual-checkin",
};

export const SEAT_ENDPOINTS = {
  GET: "/seat",
};

export const STAFF_ENDPOINTS = {
  ASSIGNED_EVENTS: "/events/assigned",
  CHECK_IN: (eventId: string) => `/events/${eventId}/check-in`,
  MANUAL_CHECK_IN: (eventId: string) => `/events/${eventId}/manual-check-in`,
  VALIDATE_TICKET: (eventId: string) => `/events/${eventId}/validate-ticket`,
};

export const INCIDENT_ENDPOINTS = {
  CREATE: "/incidents",
  MY: "/incidents/my",
  BY_EVENT: (eventId: string) => `/incidents/event/${eventId}`,
  UPDATE_STATUS: (incidentId: string) => `/incidents/${incidentId}/status`,
};

export const NOTIFICATION_ENDPOINTS = {
  SUBSCRIPTIONS: "/notifications/subscriptions",
  TEST_SEND: "/notifications/test-send",
};
