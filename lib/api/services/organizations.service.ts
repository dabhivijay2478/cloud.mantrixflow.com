/**
 * Organizations API Service
 * Service layer for organization endpoints
 */

import { ApiClient } from '../client';
import type {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../types/organizations';

export class OrganizationsService {
  private static readonly BASE_PATH = 'api/organizations';

  // Organization Management
  static async createOrganization(
    data: CreateOrganizationDto,
  ): Promise<Organization> {
    return ApiClient.post<Organization>(this.BASE_PATH, data);
  }

  static async listOrganizations(): Promise<Organization[]> {
    return ApiClient.get<Organization[]>(this.BASE_PATH);
  }

  static async getOrganization(id: string): Promise<Organization> {
    return ApiClient.get<Organization>(`${this.BASE_PATH}/${id}`);
  }

  static async updateOrganization(
    id: string,
    data: UpdateOrganizationDto,
  ): Promise<Organization> {
    return ApiClient.patch<Organization>(`${this.BASE_PATH}/${id}`, data);
  }

  static async deleteOrganization(id: string): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(`${this.BASE_PATH}/${id}`);
  }

  static async getCurrentOrganization(): Promise<Organization | null> {
    try {
      return ApiClient.get<Organization>(`${this.BASE_PATH}/current`);
    } catch {
      return null;
    }
  }

  static async setCurrentOrganization(
    id: string,
  ): Promise<Organization> {
    return ApiClient.post<Organization>(`${this.BASE_PATH}/${id}/set-current`);
  }
}
