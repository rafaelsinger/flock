import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useHydrateSession = () => {
  const { data: sessionData, status, update } = useSession();

  // Sync session data with server data whenever session changes
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
              await update(userData);
              sessionStorage.setItem('userSession', JSON.stringify(userData));
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else if (status === 'unauthenticated') {
        sessionStorage.removeItem('userSession');
        await update(null);
      }
    };

    syncWithServer();
  }, [sessionData?.user?.id, status, update]);
};
