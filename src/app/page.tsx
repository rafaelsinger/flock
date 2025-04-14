'use client';

import { LandingPage } from '@/components';
import { Directory } from '@/components';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return <LandingPage />;
  }

  return <Directory />;
}
