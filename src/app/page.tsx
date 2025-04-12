import Image from "next/image";
import { Button } from "@/components/Button";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FFF9F8]">
      {/* Navigation/Logo Area */}
      <nav className="container max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.svg" 
            alt="Flock Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8" 
          />
          <span className="text-xl font-medium text-[#F28B82]">Flock</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          {/* Content Column */}
          <div className="flex flex-col space-y-8">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-[#333333] leading-[1.1]">
              Discover where BC grads <span className="text-[#F28B82]">flock</span> after graduation.
            </h1>

            <p className="text-xl leading-relaxed text-[#333333]/70">
              Find where your classmates are landing after graduation. Browse by city, company, or industry.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                size="large"
                className="w-full cursor-pointer sm:w-auto bg-[#F28B82] hover:bg-[#F28B82]/90 hover:translate-y-[-2px] text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Continue with BC Email
              </Button>
              <p className="text-sm text-[#333333]/60">
                Roommate search and more features coming soon!
              </p>
            </div>
          </div>

          {/* Image Column */}
          <div className="flex items-center justify-center order-first md:order-last">
            <div className="relative h-[280px] w-[280px] md:h-[400px] md:w-[400px]">
              <Image 
                src="/illustration.svg" 
                alt="Flock Illustration" 
                fill 
                className="object-contain" 
                priority 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 