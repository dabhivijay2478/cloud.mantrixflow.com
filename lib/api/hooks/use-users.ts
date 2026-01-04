/**
 * Users TanStack Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateUserDto,
  type UpdateUserDto,
  UsersService,
} from "../services/users.service";

export const usersKeys = {
  all: ["users"] as const,
  current: () => [...usersKeys.all, "current"] as const,
  detail: (id: string) => [...usersKeys.all, id] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: usersKeys.current(),
    queryFn: () => UsersService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(id!),
    queryFn: () => UsersService.getUser(id!),
    enabled: !!id,
  });
}

export function useSyncUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => UsersService.syncUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.current() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserDto) => UsersService.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.current() });
    },
  });
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ completed, step }: { completed: boolean; step?: string }) =>
      UsersService.updateOnboarding(completed, step),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.current() });
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });
}
