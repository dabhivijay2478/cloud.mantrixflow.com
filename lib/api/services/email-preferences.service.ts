/**
 * Email Preferences API Service
 * Service layer for email notification preference endpoints
 */

import { ApiClient } from "../client";

export interface EmailPreferences {
  weeklyDigestEnabled: boolean;
  pipelineFailureEmails: boolean;
  marketingEmails: boolean;
}

export interface UpdateEmailPreferencesDto {
  weeklyDigestEnabled?: boolean;
  pipelineFailureEmails?: boolean;
  marketingEmails?: boolean;
}

export class EmailPreferencesService {
  private static readonly BASE_PATH = "api/email/preferences";

  static async getPreferences(): Promise<EmailPreferences> {
    return ApiClient.get<EmailPreferences>(EmailPreferencesService.BASE_PATH);
  }

  static async updatePreferences(
    data: UpdateEmailPreferencesDto,
  ): Promise<EmailPreferences> {
    return ApiClient.patch<EmailPreferences>(
      EmailPreferencesService.BASE_PATH,
      data,
    );
  }
}
