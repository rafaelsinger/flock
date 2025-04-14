'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <NextAuthSessionProvider session={session}>
      <SessionProvider>{children}</SessionProvider>
    </NextAuthSessionProvider>
  );
}
