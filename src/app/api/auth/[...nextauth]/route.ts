import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return profile?.email?.endsWith("@bc.edu") ?? false;
      }
      return false; // Deny sign in if not Google or not bc.edu
    },
    async jwt({ token, user }) {
      if (user) {
        // On first sign in, user object is available
        token.isOnboarded = user.isOnboarded ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Get isOnboarded from token instead of user
        session.user.isOnboarded = token.isOnboarded;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
    signOut: "/",
    newUser: "/auth/unauthorized",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
