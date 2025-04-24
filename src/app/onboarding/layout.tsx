import { FC, ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
}

const OnboardingLayout: FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen bg-[#FFF9F8] overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F9C5D1]/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#A7D7F9]/10 rounded-full -ml-40 -mb-40 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#F28B82]/5 rounded-full blur-3xl opacity-70"></div>

      <div className="w-full mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Logo/brand header */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center">
            <span className="text-[#F28B82] text-3xl mr-2">🦩</span>
            <h1 className="text-2xl font-bold text-[#333333]">Flock</h1>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
};

export default OnboardingLayout;
