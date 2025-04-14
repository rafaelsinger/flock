import { FC, ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
}

const OnboardingLayout: FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen bg-[#FFF9F8] overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9C5D1]/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#A7D7F9]/10 rounded-full -ml-40 -mb-40 blur-3xl"></div>

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        {/* Logo/brand header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <span className="text-[#F28B82] text-3xl mr-2">🦩</span>
            <h1 className="text-2xl font-semibold text-[#333333]">Flock</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 sm:p-10 border border-[#F9C5D1]/20 transition-all hover:shadow-lg">
          {children}
        </div>
      </div>
    </main>
  );
};

export default OnboardingLayout;
