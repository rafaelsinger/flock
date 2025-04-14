/* eslint-disable */
// @ts-nocheck
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { User } from './types/user';
import { prisma } from './lib/prisma';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    authorized: async ({ auth }) => {
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
    jwt({ token, user, trigger, session }) {
      if (trigger === 'signIn' || trigger === 'signUp') {
        token.id = user.id;
      }
      if (trigger === 'update') {
        if (session) token = { ...token, ...session };
      }
      return token;
    },
    session({ session, token, trigger }) {
      session.user = { ...session.user, ...token };
      return session;
    },
  },
  ...authConfig,
});
