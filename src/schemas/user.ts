import { z } from 'zod';
import { PostGradType } from '@prisma/client';
import { CURRENT_CLASS_YEAR } from '@/constants/general';

// Location schema
export const locationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  lat: z.number(),
  lon: z.number(),
});

// Visibility options schema
export const visibilityOptionsSchema = z.object({
  title: z.boolean().optional(),
  company: z.boolean().optional(),
  school: z.boolean().optional(),
  program: z.boolean().optional(),
  internship: z.boolean().optional(),
});

// Base user schema
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  postGradType: z.nativeEnum(PostGradType),
  isOnboarded: z.boolean(),
  title: z.string().nullable().optional(),
  program: z.string().nullable().optional(),
  discipline: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  classYear: z.number().int().min(2000).max(2100),
  industry: z.string().nullable().optional(),
  location: locationSchema.nullable().optional(),
  lookingForRoommate: z.boolean().nullable().optional(),
  visibilityOptions: visibilityOptionsSchema,
});

// Schema for graduate form data
export const graduateFormSchema = z.object({
  visibilityOptions: z.object({
    company: z.boolean(),
    title: z.boolean(),
  }),
});

// Schema for incomplete user onboarding
export const incompleteUserOnboardingSchema = z.object({
  classYear: z.number().int().min(CURRENT_CLASS_YEAR).max(2035).optional(),
  postGradType: z.nativeEnum(PostGradType).optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  industry: z.string().optional(),
  school: z.string().optional(),
  program: z.string().optional(),
  discipline: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  lookingForRoommate: z.boolean().optional(),
  visibilityOptions: visibilityOptionsSchema.optional(),
  isOnboarded: z.boolean().optional(),
});

// Full user schema including id and timestamps
export const userSchema = createUserSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Types derived from the schemas
export type UserSchema = z.infer<typeof userSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type LocationSchema = z.infer<typeof locationSchema>;
export type IncompleteUserOnboardingSchema = z.infer<typeof incompleteUserOnboardingSchema>;
