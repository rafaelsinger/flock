import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store/userStore';

export const useHydrateSession = () => {
  const { data: sessionData, status } = useSession();
  const { setUser } = useUserStore();

  // First, hydrate from sessionStorage (client-side cache)
  useEffect(() => {
    const hydrateFromStorage = () => {
      try {
        // Try to get data from sessionStorage
        const cachedSession = sessionStorage.getItem('userSession');

        if (cachedSession) {
          const parsedSession = JSON.parse(cachedSession);
          setUser(parsedSession);
        }
      } catch (error) {
        console.error('Error hydrating from sessionStorage:', error);
      }
    };

    // Only run on client-side
    if (typeof window !== 'undefined') {
      hydrateFromStorage();
    }
  }, [setUser]);

  // Then, sync with server data when session changes
  useEffect(() => {
    const syncWithServer = async () => {
      // Only fetch if we have a valid session and user ID
      if (status === 'authenticated' && sessionData?.user?.id) {
        try {
          // prevent unnecessary fetches
          const cachedSession = sessionStorage.getItem('userSession');
          const parsedCache = cachedSession ? JSON.parse(cachedSession) : null;

          // Only fetch if we don't have cached data or if the user ID changed
          if (!parsedCache || parsedCache.id !== sessionData.user.id) {
            const res = await fetch(`/api/users/${sessionData.user.id}`);
            if (res.ok) {
              const userData = await res.json();
              setUser(userData);
              sessionStorage.setItem('userSession', JSON.stringify(userData));
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else if (status === 'unauthenticated') {
        sessionStorage.removeItem('userSession');
        setUser(null);
      }
    };

    syncWithServer();
  }, [sessionData?.user?.id, status, setUser]);
};
