/**
 * Users TanStack Query Hooks
 */

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type UpdateUserDto,
  type User,
  UsersService,
} from "../services/users.service";
import type { CreateUserDto } from "../types/users";

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
    queryKey: usersKeys.detail(id || ""),
    queryFn: () => {
      if (!id) throw new Error("User ID is required");
      return UsersService.getUser(id);
    },
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

/**
 * Hook to fetch multiple users by their IDs
 * Uses React Query's useQueries to fetch multiple users efficiently
 */
export function useUsers(userIds: (string | undefined)[]) {
  const uniqueUserIds = Array.from(
    new Set(userIds.filter((id): id is string => !!id)),
  );

  const queries = useQueries({
    queries: uniqueUserIds.map((userId) => ({
      queryKey: usersKeys.detail(userId),
      queryFn: () => UsersService.getUser(userId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Return a map of userId -> user for easy lookup
  const usersMap = new Map<string, User>();
  queries.forEach((query, index) => {
    if (query.data && uniqueUserIds[index]) {
      usersMap.set(uniqueUserIds[index], query.data);
    }
  });

  return {
    usersMap,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}
