import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 5,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const stepLabels = ['About You', 'Details', 'Location', 'Privacy', 'Review'];

  return (
    <div className="w-full my-8">
      <div className="relative mb-4">
        {/* Progress bar background */}
        <div className="absolute h-1.5 bg-gray-100 rounded-full w-full -z-10" />

        {/* Animated progress bar */}
        <motion.div
          className="absolute h-1.5 bg-gradient-to-r from-[#F9C5D1] to-[#F28B82] rounded-full -z-10"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            bounce: 0,
          }}
        />

        {/* Step indicators with their labels */}
        <div className="flex justify-between items-center relative">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex flex-col items-center relative z-10"
              style={{ width: `${100 / (totalSteps - 1)}%` }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shadow-sm ${
                  step < currentStep
                    ? 'bg-[#F28B82] text-white'
                    : step === currentStep
                      ? 'bg-[#F9C5D1] text-white ring-4 ring-[#F9C5D1]/20'
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

              <motion.div
                className="absolute top-10 w-24 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.1 * index,
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              >
                <span
                  className={`text-xs font-medium ${
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
      <div className="h-8"></div> {/* Spacer for the labels */}
    </div>
  );
};
