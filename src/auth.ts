/* eslint-disable */
// @ts-nocheck
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { User } from './types/user';
import { prisma } from './lib/prisma';
import authConfig from './auth.config';
import { redirect } from 'next/navigation';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    authorized: async ({ request, auth }) => {
      console.log('SHOULD YOU BE ALLOWED TO SEE THIS: ', !!auth);
      if (!!auth) {
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
      if (trigger === 'signIn') {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${user.id}`);
        const userData = await response.json();
        token.userSession = userData;
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
