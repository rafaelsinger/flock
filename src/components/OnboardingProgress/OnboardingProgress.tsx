import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 6,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const stepLabels = ['Year', 'You', 'Details', 'Location', 'Privacy', 'Review'];

  return (
    <div className="w-full my-6 md:my-8">
      <div className="relative mb-6">
        {/* Progress bar background */}
        <div className="absolute h-2 bg-gray-100 rounded-full w-full -z-10" />

        {/* Animated progress bar */}
        <motion.div
          className="absolute h-2 bg-gradient-to-r from-[#F9C5D1] to-[#F28B82] rounded-full -z-10"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
            bounce: 0,
          }}
        />

        {/* Step indicators */}
        <div className="flex justify-between items-center relative">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center relative z-10">
              <motion.div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium shadow-sm ${
                  step < currentStep
                    ? 'bg-[#F28B82] text-white'
                    : step === currentStep
                      ? 'bg-gradient-to-br from-[#F28B82] to-[#E67C73] text-white ring-4 ring-[#F9C5D1]/20'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
                initial={{ scale: step === currentStep ? 0.8 : 1 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  mass: 0.5,
                }}
              >
                {step < currentStep ? '✓' : step}
              </motion.div>

              {/* Labels only visible on md screens and above */}
              <motion.div
                className="absolute top-12 w-24 text-center hidden md:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.1 * index,
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              >
                <span
                  className={`text-sm font-medium ${
                    step <= currentStep ? 'text-[#333333]' : 'text-[#666666]'
                  }`}
                >
                  {stepLabels[index]}
                </span>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer for labels on md screens */}
      <div className="h-0 md:h-6"></div>
    </div>
  );
};
