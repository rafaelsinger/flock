import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      isOnboarded: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isOnboarded: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isOnboarded: boolean;
  }
} 