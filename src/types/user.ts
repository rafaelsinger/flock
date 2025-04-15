// User types for the application

import { PostGradType, UserType } from '@prisma/client';

// Single User model for the entire application
export type CreateUser = {
  name: string;
  email: string;
  postGradType: PostGradType;
  userType: UserType;
  isOnboarded: boolean;
  title?: string | null;
  program?: string | null;
  discipline?: string | null;
  company?: string | null;
  school?: string | null;
  classYear: number;
  internshipSeason?: string | null;
  internshipYear?: number | null;
  internshipCompany?: string | null;
  internshipTitle?: string | null;
  industry?: string | null;
  location?: CreateLocation | null;
  lookingForRoommate?: boolean | null;
  visibilityOptions: {
    title?: boolean;
    company?: boolean;
    school?: boolean;
    program?: boolean;
    internship?: boolean;
  };
};
export type UpdateUser = CreateUser;

export type User = CreateUser & { id: string; createdAt: Date; updatedAt: Date };

export type CreateLocation = {
  country: string;
  state: string;
  city: string;
  lat: number;
  lon: number;
};

export type Location = CreateLocation & { id: string; createdAt: Date; updatedAt: Date };

export type UserWithLocation = User & { location: Location };

export interface IncompleteUserOnboarding {
  classYear?: number;
  userType?: UserType;
  postGradType?: PostGradType;
  company?: string;
  title?: string;
  industry?: string;
  school?: string;
  program?: string;
  discipline?: string;
  internshipSeason?: string;
  internshipYear?: number;
  internshipCompany?: string;
  internshipTitle?: string;
  country?: string;
  state?: string;
  city?: string;
  lat?: number;
  lon?: number;
  lookingForRoommate?: boolean;
  visibilityOptions?: {
    company?: boolean;
    title?: boolean;
    school?: boolean;
    program?: boolean;
    internship?: boolean;
  };
  isOnboarded?: boolean;
}

export type UserOnboarding = CreateUser & CreateLocation;

// Helper functions for common transformations
export const getDisplayRole = (user: User | CreateUser): string => {
  if (user.userType === 'intern') {
    return user.internshipTitle || '';
  }
  return user.postGradType === PostGradType.work ? user.title || '' : user.program || '';
};

export const getDisplayCompany = (user: User | CreateUser): string => {
  if (user.userType === 'intern') {
    return user.internshipCompany || '';
  }
  return user.postGradType === PostGradType.work ? user.company || '' : user.school || '';
};

export const getLocation = (user: User | CreateUser): string => {
  if (!user.location) return '';
  const { city, state, country } = user.location;
  return [city, state, country].filter(Boolean).join(', ');
};

export const isRoleVisible = (user: User | CreateUser, isOwnProfile: boolean): boolean => {
  if (user.userType === 'intern') {
    return isOwnProfile || (user.visibilityOptions.internship ?? true);
  }
  return (
    isOwnProfile ||
    (user.postGradType === PostGradType.work
      ? (user.visibilityOptions.title ?? true)
      : (user.visibilityOptions.program ?? true))
  );
};

export const isCompanyVisible = (user: User | CreateUser, isOwnProfile: boolean): boolean => {
  if (user.userType === 'intern') {
    return isOwnProfile || (user.visibilityOptions.internship ?? true);
  }
  return (
    isOwnProfile ||
    (user.postGradType === PostGradType.work
      ? (user.visibilityOptions.company ?? true)
      : (user.visibilityOptions.school ?? true))
  );
};
