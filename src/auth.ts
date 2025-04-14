/* eslint-disable */
// @ts-nocheck
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { User } from './types/user';
import { prisma } from './lib/prisma';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    authorized: async ({ request, auth }) => {
      console.log('SHOULD YOU BE ALLOWED TO SEE THIS: ', !!auth);
      if (!auth) {
        return NextResponse.json('Invalid auth token', { status: 401 });
      }
      return true;
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
          const userData = await prisma.user.findUnique({
            where: { id: user.id },
          });
          if (userData) {
            token.userSession = userData;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      if (trigger === 'update') {
        if (session) token = { ...token, ...session };
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
