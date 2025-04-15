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

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    authorized: async ({ request, auth }) => {
      // Forward users who aren't onboarded to onboarding step0
      if (auth?.user && auth.user.isOnboarded === false) {
        const path = request.nextUrl.pathname;
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

      // Ensure newly signed in users are redirected to onboarding
      if (session?.user && session.user.isOnboarded === false) {
        // Mark this session as needing onboarding
        session.redirectToOnboarding = true;
      }

      return session;
    },
  },
  ...authConfig,
});
