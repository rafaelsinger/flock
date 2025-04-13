/* eslint-disable */
// @ts-nocheck
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { User } from './types/user';
import { prisma } from './lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: PrismaAdapter(prisma),
  callbacks: {
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
    jwt({ token, user }) {
      console.log({ token, user });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, user }) {
      console.log({ session, user });
      session.user.id = user.id;
      return session;
    },
  },
});
