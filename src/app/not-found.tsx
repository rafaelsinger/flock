import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F8]">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <h2 className="mt-6 text-3xl font-bold text-[#333333]">
          Page Not Found
        </h2>
        <p className="mt-2 text-lg text-[#666666]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-[#F28B82] hover:text-[#E67C73]"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 