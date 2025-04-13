import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isOnboarded: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isOnboarded: boolean;
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    isOnboarded: boolean;
  }
}
