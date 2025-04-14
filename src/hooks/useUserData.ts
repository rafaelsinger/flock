import { useQuery } from '@tanstack/react-query';
import { User } from '@/types/user';
import { useSession } from 'next-auth/react';

export function useUserData(userId: string) {
  const { data: session } = useSession();
  const user = session?.user;
  const shouldFetch = user?.id !== userId;

  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data: User = await response.json();
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
  return query;
}
