// User types for the application

import { PostGradType } from '@prisma/client';

// Single User model for the entire application
export interface User {
  id: string;
  name: string;
  email: string;
  postGradType: PostGradType;
  isOnboarded: boolean;
  title?: string | null;
  program?: string | null;
  company?: string | null;
  school?: string | null;
  city: string;
  state: string;
  country: string;
  industry?: string | null;
  boroughDistrict?: string | null;
  lookingForRoommate?: boolean | null;
  visibilityOptions: {
    title?: boolean;
    company?: boolean;
    school?: boolean;
    program?: boolean;
  };
}

export type UserUpdate = Partial<User>;

// Helper functions for common transformations
export const getDisplayRole = (user: User): string => {
  return user.postGradType === PostGradType.work ? user.title || '' : user.program || '';
};

export const getDisplayCompany = (user: User): string => {
  return user.postGradType === PostGradType.work ? user.company || '' : user.school || '';
};

export const getLocation = (user: User): string => {
  return `${user.city}, ${user.state}, ${user.country}`;
};

export const isRoleVisible = (user: User, isOwnProfile: boolean): boolean => {
  return (
    isOwnProfile ||
    (user.postGradType === PostGradType.work
      ? (user.visibilityOptions.title ?? true)
      : (user.visibilityOptions.program ?? true))
  );
};

export const isCompanyVisible = (user: User, isOwnProfile: boolean): boolean => {
  return (
    isOwnProfile ||
    (user.postGradType === PostGradType.work
      ? (user.visibilityOptions.company ?? true)
      : (user.visibilityOptions.school ?? true))
  );
};
