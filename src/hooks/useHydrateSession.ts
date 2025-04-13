import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store/userStore';

export const useHydrateSession = () => {
  const { data: sessionData, status } = useSession();
  const { setUser, setOnboardingStatus, user } = useUserStore();

  // First, hydrate from sessionStorage (client-side cache)
  useEffect(() => {
    const hydrateFromStorage = () => {
      try {
        // Try to get data from sessionStorage
        const cachedSession = sessionStorage.getItem('userSession');
        const cachedOnboarding = sessionStorage.getItem('onboardingStatus');

        if (cachedSession) {
          const parsedSession = JSON.parse(cachedSession);
          setUser(parsedSession);
        }

        if (cachedOnboarding) {
          const parsedOnboarding = JSON.parse(cachedOnboarding);
          setOnboardingStatus(parsedOnboarding);
        }
      } catch (error) {
        console.error('Error hydrating from sessionStorage:', error);
      }
    };

    // Only run on client-side
    if (typeof window !== 'undefined') {
      hydrateFromStorage();
    }
  }, [setUser, setOnboardingStatus]);

  // Then, sync with server data when session changes
  useEffect(() => {
    const syncWithServer = async () => {
      if (status === 'authenticated' && sessionData) {
        // If we have session data from NextAuth, update our store and sessionStorage
        if (!user || user.id !== sessionData.user.id) {
          setUser(sessionData.user);
          sessionStorage.setItem('userSession', JSON.stringify(sessionData.user));
        }

        // Always fetch the latest onboarding status when authenticated
        if (sessionData.user?.id) {
          try {
            const response = await fetch('/api/auth/onboarding-status');
            if (response.ok) {
              const data = await response.json();

              const onboardingData = {
                isComplete: data.isOnboarded,
                postGradType: data.postGradType,
              };

              setOnboardingStatus(onboardingData);
              sessionStorage.setItem('onboardingStatus', JSON.stringify(onboardingData));
            }
          } catch (error) {
            console.error('Error fetching onboarding status:', error);
          }
        }
      } else if (status === 'unauthenticated') {
        // Clear data if user is not authenticated
        sessionStorage.removeItem('userSession');
        sessionStorage.removeItem('onboardingStatus');
        setUser(null);
        setOnboardingStatus(null);
      }
    };

    syncWithServer();
  }, [sessionData, status, setUser, setOnboardingStatus, user]);
};
