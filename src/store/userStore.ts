import { create } from 'zustand';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isOnboarded?: boolean;
  // Add other user properties as needed
}

interface OnboardingStatus {
  isComplete: boolean;
  currentStep?: string;
  // Add other onboarding properties as needed
}

interface UserState {
  user: User | null;
  onboardingStatus: OnboardingStatus | null;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  setOnboardingStatus: (status: OnboardingStatus | null) => void;
  updateOnboardingStatus: (statusData: Partial<OnboardingStatus>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  onboardingStatus: null,
  setUser: (user) => set({ user }),
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
  setOnboardingStatus: (onboardingStatus) => set({ onboardingStatus }),
  updateOnboardingStatus: (statusData) =>
    set((state) => ({
      onboardingStatus: state.onboardingStatus
        ? { ...state.onboardingStatus, ...statusData }
        : null,
    })),
}));
