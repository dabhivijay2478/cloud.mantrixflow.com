/**
 * Organizations API Service
 * Service layer for organization endpoints
 */

import { ApiClient } from "../client";
import type {
  CreateOrganizationDto,
  InviteMemberDto,
  Organization,
  OrganizationMember,
  UpdateMemberDto,
  UpdateOrganizationDto,
} from "../types/organizations";

export class OrganizationsService {
  private static readonly BASE_PATH = "api/organizations";

  // Organization Management
  static async createOrganization(
    data: CreateOrganizationDto,
  ): Promise<Organization> {
    return ApiClient.post<Organization>(OrganizationsService.BASE_PATH, data);
  }

  static async listOrganizations(): Promise<Organization[]> {
    return ApiClient.get<Organization[]>(OrganizationsService.BASE_PATH);
  }

  static async getOrganization(id: string): Promise<Organization> {
    return ApiClient.get<Organization>(
      `${OrganizationsService.BASE_PATH}/${id}`,
    );
  }

  static async updateOrganization(
    id: string,
    data: UpdateOrganizationDto,
  ): Promise<Organization> {
    return ApiClient.patch<Organization>(
      `${OrganizationsService.BASE_PATH}/${id}`,
      data,
    );
  }

  static async deleteOrganization(id: string): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${OrganizationsService.BASE_PATH}/${id}`,
    );
  }

  static async getCurrentOrganization(options?: {
    token?: string | null;
  }): Promise<Organization | null> {
    try {
      return ApiClient.get<Organization>(
        `${OrganizationsService.BASE_PATH}/current`,
        {
          token: options?.token,
        },
      );
    } catch {
      return null;
    }
  }

  static async setCurrentOrganization(id: string): Promise<Organization> {
    return ApiClient.post<Organization>(
      `${OrganizationsService.BASE_PATH}/${id}/set-current`,
    );
  }

  static async canCreateOrganization(): Promise<{ canCreate: boolean }> {
    return ApiClient.get<{ canCreate: boolean }>(
      `${OrganizationsService.BASE_PATH}/can-create`,
    );
  }

  // Organization Member Management
  static async inviteMember(
    organizationId: string,
    data: InviteMemberDto,
    options?: { token?: string | null },
  ): Promise<OrganizationMember> {
    console.log("[OrganizationsService] inviteMember called:", {
      organizationId,
      hasToken: !!options?.token,
      tokenLength: options?.token?.length || 0,
    });
    return ApiClient.post<OrganizationMember>(
      `${OrganizationsService.BASE_PATH}/${organizationId}/members/invite`,
      data,
      { token: options?.token },
    );
  }

  static async listMembers(
    organizationId: string,
  ): Promise<OrganizationMember[]> {
    return ApiClient.get<OrganizationMember[]>(
      `${OrganizationsService.BASE_PATH}/${organizationId}/members`,
    );
  }

  static async getMember(
    organizationId: string,
    memberId: string,
  ): Promise<OrganizationMember> {
    return ApiClient.get<OrganizationMember>(
      `${OrganizationsService.BASE_PATH}/${organizationId}/members/${memberId}`,
    );
  }

  static async updateMember(
    organizationId: string,
    memberId: string,
    data: UpdateMemberDto,
  ): Promise<OrganizationMember> {
    return ApiClient.patch<OrganizationMember>(
      `${OrganizationsService.BASE_PATH}/${organizationId}/members/${memberId}`,
      data,
    );
  }

  static async removeMember(
    organizationId: string,
    memberId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${OrganizationsService.BASE_PATH}/${organizationId}/members/${memberId}`,
    );
  }
}
