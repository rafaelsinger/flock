import 'next-auth';
import { DefaultSession } from 'next-auth';
import { User } from './user';

declare module 'next-auth' {
  interface Session {
    user: User & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    isOnboarded: boolean;
  }
}
