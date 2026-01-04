/**
 * Users API Types
 */

export interface CreateUserDto {
  supabaseUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

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
