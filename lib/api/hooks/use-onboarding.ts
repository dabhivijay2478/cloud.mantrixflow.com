/**
 * Onboarding TanStack Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OnboardingService } from '../services/onboarding.service';

export const onboardingKeys = {
  all: ['onboarding'] as const,
  status: () => [...onboardingKeys.all, 'status'] as const,
};

export function useOnboardingStatus() {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: () => OnboardingService.getStatus(),
  });
}

export function useUpdateOnboardingStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (step: string) => OnboardingService.updateStep(step),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => OnboardingService.complete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
    },
  });
}
