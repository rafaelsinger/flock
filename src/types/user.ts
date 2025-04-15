// User types for the application

import { PostGradType } from '@prisma/client';

// Single User model for the entire application
export type CreateUser = {
  name: string;
  email: string;
  postGradType: PostGradType;
  isOnboarded: boolean;
  title?: string | null;
  program?: string | null;
  discipline?: string | null;
  company?: string | null;
  school?: string | null;
  classYear: number;
  industry?: string | null;
  location?: Location | null;
  lookingForRoommate?: boolean | null;
  visibilityOptions: {
    title?: boolean;
    company?: boolean;
    school?: boolean;
    program?: boolean;
  };
};

export type User = CreateUser & { id: string; createdAt: Date; updatedAt: Date };

export type CreateLocation = {
  country: string;
  state: string;
  city: string;
  lat: number;
  lon: number;
};

export type Location = CreateLocation & { id: string; createdAt: Date; updatedAt: Date };

export type IncompleteUserOnboarding = Partial<CreateUser & CreateLocation>;
export type UserOnboarding = CreateUser & CreateLocation;

// Helper functions for common transformations
export const getDisplayRole = (user: User): string => {
  return user.postGradType === PostGradType.work ? user.title || '' : user.program || '';
};

export const getDisplayCompany = (user: User): string => {
  return user.postGradType === PostGradType.work ? user.company || '' : user.school || '';
};

export const getLocation = (user: User): string => {
  if (!user.location) return '';
  const { city, state, country } = user.location;
  return [city, state, country].filter(Boolean).join(', ');
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
