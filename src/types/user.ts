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
  location?: CreateLocation | null;
  lookingForRoommate?: boolean | null;
  personalEmail?: string | null;
  visibilityOptions: {
    title?: boolean;
    company?: boolean;
    school?: boolean;
    program?: boolean;
    internship?: boolean;
  };
};

// Type for graduate form data with specific visibility options
export type GraduateFormData = {
  visibilityOptions: {
    company: boolean;
    title: boolean;
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
  postGradType?: PostGradType;
  company?: string;
  title?: string;
  industry?: string;
  school?: string;
  program?: string;
  discipline?: string;
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
  if (user.postGradType === PostGradType.school) {
    return user.program || '';
  }
  if (user.postGradType === PostGradType.work || user.postGradType === PostGradType.internship) {
    return user.title || '';
  }
  return '';
};

export const getDisplayCompany = (user: User | CreateUser): string => {
  if (user.postGradType === PostGradType.school) {
    return user.school || '';
  }
  if (user.postGradType === PostGradType.work || user.postGradType === PostGradType.internship) {
    return user.company || '';
  }
  return '';
};

export const getLocation = (user: User | CreateUser): string => {
  if (!user.location) return '';
  const { city, state, country } = user.location;
  return [city, state, country].filter(Boolean).join(', ');
};

export const isRoleVisible = (user: User | CreateUser, isOwnProfile: boolean): boolean => {
  if (user.postGradType === PostGradType.school) {
    return isOwnProfile || (user.visibilityOptions.program ?? true);
  }
  if (user.postGradType === PostGradType.work || user.postGradType === PostGradType.internship) {
    return isOwnProfile || (user.visibilityOptions.title ?? true);
  }
  return isOwnProfile;
};

export const isCompanyVisible = (user: User | CreateUser, isOwnProfile: boolean): boolean => {
  if (user.postGradType === PostGradType.school) {
    return isOwnProfile || (user.visibilityOptions.school ?? true);
  }
  if (user.postGradType === PostGradType.work || user.postGradType === PostGradType.internship) {
    return isOwnProfile || (user.visibilityOptions.company ?? true);
  }
  return isOwnProfile;
};
