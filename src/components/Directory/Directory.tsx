'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';
import { Map } from '@/components/Map';
import { DirectoryContent } from './DirectoryContent';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export const Directory = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userId = session?.user?.id;
  const isOnboarded = session?.user.isOnboarded;

  // Check if onboarding is complete and session isn't loading
  if (!isOnboarded && status !== 'loading') {
    router.push('/onboarding/step1');

    // Show loading while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF9F8]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F28B82] mx-auto mb-6"></div>
          <p className="text-[#666666] text-lg">Redirecting to onboarding...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F8] overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9C5D1]/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#A7D7F9]/10 rounded-full -ml-40 -mb-40 blur-3xl"></div>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(249, 197, 209, 0.15)' }}
        >
          {/* Pink gradient accent */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#F9C5D1] to-[#F28B82]"></div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <motion.h1
                className="text-4xl font-bold text-[#333333] mb-2"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="inline-block mr-2">🦩</span>
                Directory
              </motion.h1>
              <motion.p
                className="text-lg text-[#666666]"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Discover where your classmates are heading after graduation
              </motion.p>
            </div>

            {/* Profile Link */}
            {userId ? (
              <motion.div
                className="mt-4 md:mt-0"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href={`/profile/${userId}`}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-[#F9C5D1]/10 text-[#F28B82] hover:bg-[#F9C5D1]/20 transition-all hover:scale-105 group"
                >
                  <FaUserCircle className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                  <span>Your Profile</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                className="text-[#F28B82] mt-4 md:mt-0"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <FaUserCircle className="w-6 h-6" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          className="h-[500px] mb-12 rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(167, 215, 249, 0.15)' }}
        >
          <Map />
        </motion.div>

        {/* Directory Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <DirectoryContent />
        </motion.div>
      </main>
    </div>
  );
};
