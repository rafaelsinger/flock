import Link from "next/link";

interface NotFoundStateProps {
  title?: string;
  message?: string;
  linkText?: string;
  linkHref?: string;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  linkText = "Return Home",
  linkHref = "/",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F8]">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <h2 className="mt-6 text-3xl font-bold text-[#333333]">{title}</h2>
        <p className="mt-2 text-lg text-[#666666]">{message}</p>
        <Link
          href={linkHref}
          className="mt-4 inline-block text-[#F28B82] hover:text-[#E67C73]"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
};
