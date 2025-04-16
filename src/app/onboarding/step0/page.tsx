'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IncompleteUserOnboarding } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';

const Step0: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate class year options dynamically - current year plus 3 future years
  const currentYear = new Date().getFullYear();
  const classYears = Array.from({ length: 4 }, (_, i) => (currentYear + i).toString()).sort(
    (a, b) => Number(a) - Number(b)
  ); // Sort in ascending order

  const updateOnboardingData = useMutation({
    mutationFn: (year: string) => {
      // Process selected year
      const selectedYearNum = parseInt(year);

      const data: IncompleteUserOnboarding = {
        classYear: selectedYearNum,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);
      router.push('/onboarding/step1');
    },
  });

  useEffect(() => {
    router.prefetch('/onboarding/step1');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedYear) {
      setIsSubmitting(true);
      updateOnboardingData.mutate(selectedYear);
    }
  };

  // Helper to display a role indicator for each year option
  const getUserTypeIndicator = (year: string) => {
    const yearNum = parseInt(year);
    return yearNum === 2025 ? 'New Grad' : 'Intern';
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-100px)] flex flex-col justify-center px-4 py-12 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Card container */}
      <motion.div
        className="w-full bg-white rounded-2xl shadow-lg p-8 md:p-12 overflow-hidden relative"
        variants={itemVariants}
      >
        {/* Top decoration pattern */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F9C5D1] via-[#F28B82] to-[#C06C84]"></div>

        <OnboardingProgress currentStep={1} totalSteps={6} />

        <motion.div className="text-center mb-10 mt-4" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">Welcome to Flock!</h1>
          <p className="text-lg md:text-xl text-[#666666]">Let&apos;s start with your class year</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Year selection grid */}
          <motion.div className="space-y-0" variants={itemVariants}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
              {classYears.map((year) => (
                <motion.button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`py-6 px-4 cursor-pointer text-center rounded-xl transition-all flex flex-col items-center justify-center ${
                    selectedYear === year
                      ? 'border-2 border-[#F28B82] bg-gradient-to-br from-[#F28B82]/10 to-[#F9C5D1]/10 shadow-md ring-2 ring-[#F28B82]/20'
                      : 'border-2 border-[#F9C5D1]/60 hover:border-[#F9C5D1] hover:bg-[#F9C5D1]/5 hover:shadow-sm'
                  }`}
                >
                  <span
                    className={`text-2xl md:text-3xl font-semibold mb-1 ${
                      selectedYear === year ? 'text-[#E67C73]' : 'text-[#333333]'
                    }`}
                  >
                    {year}
                  </span>
                  <span
                    className={`text-xs md:text-sm ${
                      selectedYear === year ? 'text-[#E67C73]/80' : 'text-[#666666]'
                    }`}
                  >
                    Class of {year}
                  </span>
                  <span
                    className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                      year === '2025'
                        ? 'bg-[#A7D7F9]/20 text-[#4A90E2]'
                        : 'bg-[#F9C5D1]/20 text-[#E67C73]'
                    }`}
                  >
                    {getUserTypeIndicator(year)}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Continue button */}
          <motion.div variants={itemVariants} className="flex justify-center pt-4">
            <motion.button
              type="submit"
              disabled={!selectedYear || isSubmitting}
              whileHover={selectedYear && !isSubmitting ? { scale: 1.03 } : {}}
              whileTap={selectedYear && !isSubmitting ? { scale: 0.98 } : {}}
              className={`px-8 py-3 rounded-xl transition-all text-base md:text-lg font-medium w-full sm:w-auto sm:min-w-[180px] ${
                selectedYear && !isSubmitting
                  ? 'bg-gradient-to-r from-[#F28B82] to-[#E67C73] text-white shadow-md hover:shadow-lg'
                  : 'bg-[#F9C5D1]/50 cursor-not-allowed text-white/70'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Continue'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Step0;
