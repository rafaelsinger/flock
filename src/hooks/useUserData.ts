import { useQuery } from '@tanstack/react-query';
import { UserWithLocation } from '@/types/user';
import { useSession } from 'next-auth/react';

type UserDataResponse = {
  data: UserWithLocation | null;
  isLoading: boolean;
  error: Error | null;
};

export function useUserData(userId: string): UserDataResponse {
  const { data: session } = useSession();
  const user = session?.user;
  const shouldFetch = user?.id !== userId;

  const query = useQuery<UserWithLocation, Error>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data: UserWithLocation = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: shouldFetch, // Only run the query if we need to fetch
  });

  // if own profile
  if (!shouldFetch) {
    return {
      data: user,
      isLoading: false,
      error: null,
    };
  }

  if (query instanceof Error) {
    return {
      data: null,
      isLoading: false,
      error: query,
    };
  }
  return {
    data: query.data as UserWithLocation,
    isLoading: query.isLoading,
    error: null,
  };
}
