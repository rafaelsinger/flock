// User types for the application

// Single User model for the entire application
export interface User {
  id: string;
  name: string;
  postGradType: 'work' | 'school';
  title?: string | null;
  program?: string | null;
  company?: string | null;
  school?: string | null;
  city: string;
  state: string;
  country: string;
  industry?: string | null;
  visibilityOptions: {
    role?: boolean;
    company?: boolean;
    school?: boolean;
    program?: boolean;
  };
}

// Helper functions for common transformations
export const getDisplayRole = (user: User): string => {
  return user.postGradType === 'work' ? user.title || '' : user.program || '';
};

export const getDisplayCompany = (user: User): string => {
  return user.postGradType === 'work' ? user.company || '' : user.school || '';
};

export const getLocation = (user: User): string => {
  return `${user.city}, ${user.state}, ${user.country}`;
};

export const isRoleVisible = (user: User, isOwnProfile: boolean): boolean => {
  return (
    isOwnProfile ||
    (user.postGradType === 'work'
      ? (user.visibilityOptions.role ?? true)
      : (user.visibilityOptions.program ?? true))
  );
};

export const isCompanyVisible = (user: User, isOwnProfile: boolean): boolean => {
  return (
    isOwnProfile ||
    (user.postGradType === 'work'
      ? (user.visibilityOptions.company ?? true)
      : (user.visibilityOptions.school ?? true))
  );
};
