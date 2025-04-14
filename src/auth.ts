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
      if (trigger === 'signUp') {
        token.id = user.id;
        token.isOnboarded = user.isOnboarded;
      }
      if (trigger === 'signIn' && user?.id) {
        try {
          // Make sure we have a base URL
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/users/${user.id}`);

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          token.userSession = userData;
        } catch (error) {
          console.error('Error fetching user data in JWT callback:', error);
          token.userSession = user;
        }
      }
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    session({ session, token, trigger }) {
      if (token.id) {
        session.user.id = token.id;
        session.user.isOnboarded = token.isOnboarded;
      }
      if (token.userSession) {
        session.user = { ...session.user, ...token.userSession };
      }
      return session;
    },
  },
  ...authConfig,
});
