import AsyncStorage from "@react-native-async-storage/async-storage";

import { api, STORAGE_KEYS } from "../api/api";
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from "../constants";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterSuccessResponse,
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
}

export const authService = new AuthService();
