import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store/userStore'; // Assuming you have a Zustand store for user data

export const useHydrateSession = () => {
  const { data: sessionData, status } = useSession();
  const { setUser, setOnboardingStatus, user, onboardingStatus } = useUserStore();

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

  // Update sessionStorage when session data changes
  useEffect(() => {
    const updateStorage = async () => {
      if (status === 'authenticated' && sessionData) {
        // If we have session data from NextAuth, update our store and sessionStorage
        if (!user || user.id !== sessionData.user.id) {
          setUser(sessionData.user);
          sessionStorage.setItem('userSession', JSON.stringify(sessionData.user));

          // Fetch onboarding status if needed
          if (!onboardingStatus && user?.id) {
            try {
              const response = await fetch(`/api/users/${sessionData.user.id}`);
              if (response.ok) {
                const userData = await response.json();
                setOnboardingStatus(userData.onboardingStatus);
                sessionStorage.setItem(
                  'onboardingStatus',
                  JSON.stringify(userData.onboardingStatus)
                );
              }
            } catch (error) {
              console.error('Error fetching onboarding status:', error);
            }
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

    updateStorage();
  }, [sessionData, status, setUser, setOnboardingStatus, user, onboardingStatus]);
};
