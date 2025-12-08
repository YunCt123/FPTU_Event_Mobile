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
};

export const USER_ENDPOINTS = {
  ME: "/users/me",
};

export const CAMPUS_ENDPOINTS = {
  LIST: "/campus",
};

export const EVENT_ENDPOINTS = {
  LIST: "/events",
};
