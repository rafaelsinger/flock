export type PostGradType = 'work' | 'school';

export interface OnboardingData {
  postGradType?: PostGradType;
  work?: {
    company: string;
    role: string;
    industry: string;
  };
  school?: {
    name: string;
    program: string;
  };
  location?: {
    country: string;
    state: string;
    city: string;
    borough?: string;
  };
  roommateInfo?: string;
  visibility?: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showRoommateInfo: boolean;
  };
} 