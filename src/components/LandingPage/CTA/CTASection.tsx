'use client';
import { Button } from '@/components/Button';

interface CTASectionProps {
  handleSignIn: () => void;
}

export const CTASection = ({ handleSignIn }: CTASectionProps) => {
  return (
    <section className="relative py-24 bg-transparent">
      {/* Remove the separate gradient that might be causing issues */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-[#F9C5D1]/10 via-white/30 to-transparent pointer-events-none"></div> */}

      <div className="container max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
        <div className="bg-white/80 backdrop-blur-md p-10 md:p-16 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#F9C5D1]/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#A7D7F9]/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl"></div>

          {/* Flamingo icon */}
          <div className="inline-flex items-center justify-center mb-6">
            <span className="text-4xl">🦩</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-[#333333] mb-6">
            Ready to find your flock?
          </h2>
          <p className="text-xl text-[#333333]/70 mb-8 max-w-2xl mx-auto">
            Join your classmates and discover where Eagles land after graduation.
          </p>
          <Button
            onClick={handleSignIn}
            size="large"
            className="bg-[#F28B82] hover:bg-[#F28B82]/90 hover:translate-y-[-2px] text-white shadow-lg hover:shadow-xl transition-all duration-200 px-10 py-4 text-lg"
          >
            Sign in with BC Email
          </Button>
          <p className="mt-6 text-sm text-[#333333]/60">For Boston College students only</p>
        </div>
      </div>
    </section>
  );
};
