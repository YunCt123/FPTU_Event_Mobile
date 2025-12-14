export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  campusId: number;
  studentCode: string;
  phoneNumber: string;
  gender: boolean;
  address: string;
  avatar: string;
  studentCardImage: string;
}

export interface RegisterPendingResponse {
  message: string;
  status: "PENDING";
  userId: number;
}

export interface RegisterSuccessResponse {
  message: string;
  accessToken: string;
}

export type RegisterResponse =
  | RegisterPendingResponse
  | RegisterSuccessResponse;

export interface GoogleLoginResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}