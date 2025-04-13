export type PostGradType = "work" | "school";

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
    showCompany?: boolean;
    showRole?: boolean;
    showSchool?: boolean;
    showProgram?: boolean;
  };
}
