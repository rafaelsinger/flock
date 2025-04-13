'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';
import { Map } from '@/components/Map';
import { DirectoryContent } from './DirectoryContent';
import { useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';

export const Directory = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { onboardingStatus } = useUserStore();

  // Prefetch the user data when hovering over the profile link
  const handleMouseEnter = () => {
    if (session?.user?.id) {
      queryClient.prefetchQuery({
        queryKey: ['user', session.user.id],
        queryFn: async () => {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  };

  // Check if onboarding is complete
  if (onboardingStatus && !onboardingStatus.isComplete) {
    return <div>Please complete onboarding</div>;
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
          <Link
            href={`/profile/${session?.user?.id}`}
            className="absolute top-8 right-8 text-[#F28B82] hover:text-[#E67C73] transition-colors"
            onMouseEnter={handleMouseEnter}
          >
            <FaUserCircle className="w-8 h-8" />
          </Link>
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
