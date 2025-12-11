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
};

export const SEAT_ENDPOINTS = {
  GET: "/seat",
  LIST: "/tickets/me",
  CREATE: "/tickets",
  BY_ID: (id: string) => `/tickets/${id}`,
  BY_QR: (qrCode: string) => `/tickets/qr/${qrCode}`,
  SCAN: "/tickets/scan",
};

export const STAFF_ENDPOINTS = {
  ASSIGNED_EVENTS: "/events/assigned",
  CHECK_IN: (eventId: string) => `/events/${eventId}/check-in`,
  MANUAL_CHECK_IN: (eventId: string) => `/events/${eventId}/manual-check-in`,
  VALIDATE_TICKET: (eventId: string) => `/events/${eventId}/validate-ticket`,
  INCIDENT_REPORT: (eventId: string) => `/events/${eventId}/incident`,
};
