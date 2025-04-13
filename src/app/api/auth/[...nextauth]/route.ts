import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
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
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  }
});

export { handler as GET, handler as POST }; 