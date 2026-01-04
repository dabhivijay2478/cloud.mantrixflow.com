/**
 * Users API Service
 * Service layer for user endpoints
 */

import { ApiClient } from "../client";
import type { CreateUserDto } from "../types/users";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  status: "active" | "inactive" | "suspended";
  currentOrgId?: string;
  onboardingCompleted: boolean;
  onboardingStep?: string;
  lastLoginAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

export class UsersService {
  private static readonly BASE_PATH = "api/users";

  // User Management
  static async syncUser(
    data: CreateUserDto,
    options?: { token?: string | null },
  ): Promise<User> {
    return ApiClient.post<User>(`${this.BASE_PATH}/sync`, data, {
      token: options?.token,
    });
  }

  static async getCurrentUser(options?: {
    token?: string | null;
  }): Promise<User> {
    return ApiClient.get<User>(`${this.BASE_PATH}/me`, {
      token: options?.token,
    });
  }

  static async getUser(id: string): Promise<User> {
    return ApiClient.get<User>(`${this.BASE_PATH}/${id}`);
  }

  static async updateUser(data: UpdateUserDto): Promise<User> {
    return ApiClient.patch<User>(`${this.BASE_PATH}/me`, data);
  }

  static async updateOnboarding(
    completed: boolean,
    step?: string,
  ): Promise<User> {
    return ApiClient.patch<User>(`${this.BASE_PATH}/me/onboarding`, {
      completed,
      step,
    });
  }
}
