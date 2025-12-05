export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
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
