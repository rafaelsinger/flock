'use client';

import { LandingPage } from '@/components';
import { Directory } from '@/components';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in but not onboarded, redirect to step0
    if (session?.user && session.user.isOnboarded === false) {
      router.push('/onboarding/step0');
    }
  }, [session, router]);

  if (!session) {
    return <LandingPage />;
  }

  return <Directory />;
}
