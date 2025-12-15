import AsyncStorage from "@react-native-async-storage/async-storage";

import { api, STORAGE_KEYS } from "../api/api";
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from "../constants";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterSuccessResponse,
  GoogleLoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../types/auth";
import { User, UpdateUserProfileRequest } from "../types/user";

class AuthService {
  private async persistTokens(accessToken?: string, refreshToken?: string) {
    if (accessToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  /**
   * Get Google OAuth URL để redirect user
   */
  getGoogleAuthUrl(): string {
    return `${process.env.EXPO_PUBLIC_API_URL}${AUTH_ENDPOINTS.GOOGLE}`;
  }

  /**
   * Xử lý Google login sau khi callback
   * Backend sẽ trả về accessToken sau khi user đăng nhập Google thành công
   */
  async handleGoogleCallback(
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    await this.persistTokens(accessToken, refreshToken);
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, payload);
    await this.persistTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const data = await api.post<RegisterResponse>(
      AUTH_ENDPOINTS.REGISTER,
      payload
    );

    if (this.isRegisterSuccess(data)) {
      await this.persistTokens(data.accessToken);
    }

    return data;
  }

  async getCurrentUser(): Promise<User> {
    const data = await api.get<User>(USER_ENDPOINTS.ME);
    // Có thể lưu user vào AsyncStorage nếu cần dùng offline
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
    return data;
  }

  async updateProfile(payload: UpdateUserProfileRequest): Promise<User> {
    const data = await api.patch<User>(USER_ENDPOINTS.UPDATE_ME, payload);
    // Cập nhật user trong AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
    return data;
  }

  private isRegisterSuccess(
    response: RegisterResponse
  ): response is RegisterSuccessResponse {
    return "accessToken" in response;
  }

  async forgotPassword(
    payload: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return await api.post<ForgotPasswordResponse>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      payload
    );
  }

  async verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return await api.post<VerifyOtpResponse>(
      AUTH_ENDPOINTS.VERIFY_OTP,
      payload
    );
  }

  async resetPassword(
    payload: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return await api.post<ResetPasswordResponse>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      payload
    );
  }

  async changePassword(
    payload: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    return await api.post<ChangePasswordResponse>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      payload
    );
  }
}

export const authService = new AuthService();
