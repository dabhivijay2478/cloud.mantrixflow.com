/**
 * Onboarding API Service
 * Service layer for onboarding endpoints
 */

import { ApiClient } from "../client";

export interface OnboardingStatus {
  completed: boolean;
  step: string;
  currentOrgId?: string;
}

export class OnboardingService {
  private static readonly BASE_PATH = "api/onboarding";

  static async getStatus(): Promise<OnboardingStatus> {
    return ApiClient.get<OnboardingStatus>(
      `${OnboardingService.BASE_PATH}/status`,
    );
  }

  static async updateStep(step: string): Promise<OnboardingStatus> {
    return ApiClient.patch<OnboardingStatus>(
      `${OnboardingService.BASE_PATH}/step`,
      {
        step,
      },
    );
  }

  static async complete(): Promise<OnboardingStatus> {
    return ApiClient.post<OnboardingStatus>(
      `${OnboardingService.BASE_PATH}/complete`,
    );
  }

  static async createOrg(
    data: { name: string },
    options?: { token?: string | null },
  ): Promise<{ success: boolean; data: { id: string; name: string } }> {
    return ApiClient.post<{
      success: boolean;
      data: { id: string; name: string };
    }>(`${OnboardingService.BASE_PATH}/create-org`, data, {
      token: options?.token,
    });
  }
}
