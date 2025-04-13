"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Authentication Error
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {error === "AccessDenied"
            ? "Please use your @bc.edu email address to sign in"
            : "An error occurred during sign in"}
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-[#F28B82] hover:text-[#E67C73]"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
