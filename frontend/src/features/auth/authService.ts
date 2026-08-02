/**
 * RentHub — Auth API Service
 *
 * All auth API calls go through this service.
 * The Zustand store calls these functions and updates state accordingly.
 */

import apiClient, { apiPost } from "@/lib/axios";
import type { ApiSuccessResponse, LoginCredentials, RegisterData, User } from "@/types";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse {
  token: TokenResponse;
  user: User;
}

const AuthService = {
  /**
   * Register a new user account.
   */
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiPost<ApiSuccessResponse<User>>("/auth/register", data);
    return response.data!;
  },

  /**
   * Login and receive access token + user data.
   * The refresh token is automatically set as an httpOnly cookie by the server.
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiPost<ApiSuccessResponse<LoginResponse>>("/auth/login", credentials);
    return response.data!;
  },

  /**
   * Silently refresh the access token using the httpOnly refresh cookie.
   */
  refreshToken: async (): Promise<TokenResponse> => {
    const response = await apiPost<ApiSuccessResponse<TokenResponse>>("/auth/refresh");
    return response.data!;
  },

  /**
   * Logout the current user and clear the refresh cookie.
   */
  logout: async (): Promise<void> => {
    await apiPost("/auth/logout");
  },

  /**
   * Verify email address using a token from the verification link.
   */
  verifyEmail: async (token: string): Promise<User> => {
    const response = await apiPost<ApiSuccessResponse<User>>("/auth/verify-email", { token });
    return response.data!;
  },

  /**
   * Resend email verification link.
   */
  resendVerification: async (): Promise<void> => {
    await apiPost("/auth/resend-verification");
  },

  /**
   * Send a password reset link to the provided email.
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiPost("/auth/forgot-password", { email });
  },

  /**
   * Reset the password using the token from the reset email.
   */
  resetPassword: async (token: string, new_password: string, confirm_password: string): Promise<void> => {
    await apiPost("/auth/reset-password", { token, new_password, confirm_password });
  },

  /**
   * Get the currently authenticated user's full profile.
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiSuccessResponse<User>>("/users/me");
    return response.data.data!;
  },
};

export default AuthService;
