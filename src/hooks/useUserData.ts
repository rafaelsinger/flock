import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';
import { User } from '@/types/user';

export function useUserData(userId: string) {
  const { user } = useUserStore();
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
