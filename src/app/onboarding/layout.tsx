import { FC, ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
}

const OnboardingLayout: FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen bg-[#FFF9F8]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#F9C5D1]/20">
          {children}
        </div>
      </div>
    </main>
  );
};

export default OnboardingLayout; 