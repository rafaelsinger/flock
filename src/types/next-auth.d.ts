import 'next-auth';
import { DefaultSession } from 'next-auth';
import { UserWithLocation } from './user';

declare module 'next-auth' {
  interface Session {
    user: UserWithLocation & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    isOnboarded: boolean;
  }
}
