import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email?.endsWith('@bc.edu')) {
        // Find user in database
        const user = await prisma.user.findUnique({
          where: { bcEmail: profile.email },
          select: { id: true },
        });

        if (user) {
          // Store the database ID in the account object
          account.userId = user.id;
          return true;
        }
        return true;
      }
      return false;
    },
    async jwt({ token, account }) {
      // On initial sign in, account is available
      if (account) {
        token.userId = account.userId!;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Add the userId to the session
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
    signOut: '/',
    newUser: '/auth/unauthorized',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
