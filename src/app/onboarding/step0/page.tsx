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
      const data: IncompleteUserOnboarding = { classYear: parseInt(year) };
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
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <OnboardingProgress currentStep={1} totalSteps={6} />

      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Welcome to Flock!</h1>
        <p className="text-lg text-[#666666]">First, let us know your class year</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div className="space-y-6" variants={itemVariants}>
          <div className="flex flex-col space-y-3 max-w-sm mx-auto">
            {classYears.map((year) => (
              <motion.button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 cursor-pointer text-center rounded-xl transition-all ${
                  selectedYear === year
                    ? 'border-2 border-[#F28B82] bg-[#F28B82]/10 shadow-md ring-2 ring-[#F28B82]/20'
                    : 'border-2 border-[#F9C5D1] hover:bg-[#F9C5D1]/5 hover:shadow-sm'
                }`}
              >
                <span
                  className={`text-xl font-medium ${
                    selectedYear === year ? 'text-[#E67C73]' : 'text-[#333333]'
                  }`}
                >
                  {year}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.button
            type="submit"
            disabled={!selectedYear || isSubmitting}
            whileHover={selectedYear ? { scale: 1.02 } : {}}
            whileTap={selectedYear ? { scale: 0.98 } : {}}
            className={`px-6 py-2.5 rounded-lg transition-all cursor-pointer ${
              selectedYear && !isSubmitting
                ? 'bg-[#F28B82] hover:bg-[#E67C73] text-white shadow-sm hover:shadow'
                : 'bg-[#F9C5D1]/50 cursor-not-allowed text-white/70'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
  );
};

export default Step0;
