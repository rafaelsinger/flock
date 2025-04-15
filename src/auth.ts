/* eslint-disable */
// @ts-nocheck
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { User } from './types/user';
import { prisma } from './lib/prisma';
import authConfig from './auth.config';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

// Create a custom adapter based on PrismaAdapter
const customPrismaAdapter = () => {
  const adapter = PrismaAdapter(prisma);
  return {
    ...adapter,
    createUser: (data) => {
      // Add required classYear field with a default value
      return prisma.user.create({
        data: {
          ...data,
          classYear: 2024, // Default class year (can be updated later during onboarding)
          isOnboarded: false, // Ensure user always needs to go through onboarding
        },
      });
    },
  };
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: customPrismaAdapter(),
  session: { strategy: 'jwt' },
  callbacks: {
    authorized: async ({ request, auth }) => {
      // Forward users who aren't onboarded to step0
      if (auth?.user && auth.user.isOnboarded === false) {
        const path = request.nextUrl.pathname;
        // If they're trying to access any route except onboarding/step0, redirect them
        if (path !== '/onboarding/step0' && !path.startsWith('/api/')) {
          return Response.redirect(new URL('/onboarding/step0', request.nextUrl));
        }
      }
      return !!auth;
    },
    signIn({ account, profile }) {
      if (
        account.provider === 'google' &&
        profile.email_verified &&
        profile.email.endsWith('@bc.edu')
      ) {
        return true;
      }
      return false;
    },
    async jwt({ token, user, trigger, session }) {
      // make sure token.user always exists
      if (user?.id && !token?.user) {
        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/users/${user.id}`);

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          token.user = userData;
        } catch (error) {
          console.error('Error fetching user data in JWT callback:', error);
          token.user = user;
        }
      }
      // if session i.e. update, update token.ser
      if (session) {
        token.user = { ...token.user, ...session.user };
      }
      return token;
    },
    session({ session, token }) {
      // make sure always populate the session.user using token.user
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  ...authConfig,
});
