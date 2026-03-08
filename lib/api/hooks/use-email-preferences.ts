/**
 * Email Preferences TanStack Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EmailPreferencesService,
  type UpdateEmailPreferencesDto,
} from "../services/email-preferences.service";

export const emailPreferencesKeys = {
  all: ["email-preferences"] as const,
  current: () => [...emailPreferencesKeys.all, "current"] as const,
};

export function useEmailPreferences() {
  return useQuery({
    queryKey: emailPreferencesKeys.current(),
    queryFn: () => EmailPreferencesService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateEmailPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmailPreferencesDto) =>
      EmailPreferencesService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailPreferencesKeys.current() });
    },
  });
}
