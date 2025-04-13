'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F8]">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#333333] mb-4">Something went wrong</h1>
        <p className="text-[#666666] mb-6">{errorMessage}</p>
        <div className="flex justify-between">
          <Link
            href="/"
            className="px-4 py-2 bg-[#F28B82] hover:bg-[#E67C73] text-white rounded-lg transition-all"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-[#F28B82] text-[#F28B82] hover:bg-[#F28B82]/10 rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
