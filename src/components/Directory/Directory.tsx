'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';
import { Map } from '@/components/Map';
import { DirectoryContent } from './DirectoryContent';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';

export const Directory = () => {
  const { data: session } = useSession();
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  // Prefer session ID, fall back to store ID
  const userId = session?.user?.id || user?.id;
  const isOnboarded = user?.isOnboarded;

  // Check if onboarding is complete
  if (!isLoading && isOnboarded === false) {
    router.push('/onboarding/step1');

    // Show loading while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F28B82] mx-auto mb-4"></div>
          <p className="text-[#666666]">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8]">
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative">
          <div>
            <h1 className="text-4xl font-bold text-[#111111]">Directory</h1>
            <p className="text-[#444444] mt-2 text-lg">Explore where BC grads are heading next</p>
          </div>

          {/* Profile Link */}
          {userId ? (
            <Link
              href={`/profile/${userId}`}
              className="absolute top-8 right-8 text-[#F28B82] hover:text-[#E67C73] transition-colors"
            >
              <FaUserCircle className="w-8 h-8" />
            </Link>
          ) : (
            <div className="absolute top-8 right-8 text-[#F28B82]">
              <FaUserCircle className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="h-[500px] mb-12 rounded-xl overflow-hidden bg-white shadow-md border border-gray-100">
          <Map />
        </div>

        {/* Directory Content */}
        <DirectoryContent />
      </main>
    </div>
  );
};
