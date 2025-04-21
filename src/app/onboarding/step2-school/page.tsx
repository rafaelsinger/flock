'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IncompleteUserOnboarding } from '@/types/user';
import { motion } from 'framer-motion';
import { FaUniversity } from 'react-icons/fa';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { OnboardingProgress } from '@/components';
import { PostGradType } from '@prisma/client';
import { SchoolSelect } from '@/components/Select/SchoolSelect';
import { ProgramTypeSelect } from '@/components/Select/ProgramTypeSelect';
import { DisciplineSelect } from '@/components/Select/DisciplineSelect';

const Step2School: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as IncompleteUserOnboarding;

  const [formData, setFormData] = useState({
    school: '',
    program: '',
    discipline: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateOnboardingData = useMutation({
    mutationFn: (schoolData: IncompleteUserOnboarding) => {
      const data: IncompleteUserOnboarding = {
        ...previousData,
        school: schoolData.school,
        program: schoolData.program,
        discipline: schoolData.discipline,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);
      router.push('/onboarding/step3');
    },
  });

  useEffect(() => {
    if (!previousData || previousData.postGradType !== PostGradType.school) {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  useEffect(() => {
    setIsFormValid(
      Boolean(formData.school?.trim()) &&
        Boolean(formData.discipline?.trim()) &&
        Boolean(formData.program?.trim())
    );
  }, [formData]);

  useEffect(() => {
    router.prefetch('/onboarding/step3');
  }, [router]);

  if (!previousData || previousData.postGradType !== PostGradType.school) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateOnboardingData.mutate(formData);
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: '0 4px 6px rgba(167, 215, 249, 0.1)' },
    blur: { scale: 1, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' },
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
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#A7D7F9] via-[#7BC0F5] to-[#5BAAE7]"></div>

        <OnboardingProgress currentStep={3} totalSteps={6} />

        <motion.div className="text-center mb-10 mt-4" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
            Tell us about your studies
          </h1>
          <p className="text-lg md:text-xl text-[#666666]">
            Share details about your upcoming program
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <label
                htmlFor="school"
                className="flex items-center text-sm font-medium text-[#333333] mb-2"
              >
                <FaUniversity className="mr-2 text-[#7BC0F5]" />
                School
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'school' ? 'focus' : 'blur'}
              >
                <SchoolSelect
                  value={formData.school}
                  onChange={(school) => setFormData((prev) => ({ ...prev, school }))}
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="program"
                className="flex items-center text-sm font-medium text-[#333333] mb-2"
              >
                <HiOutlineAcademicCap className="mr-2 text-[#7BC0F5]" />
                Program Type
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'program' ? 'focus' : 'blur'}
                onFocus={() => setActiveField('program')}
                onBlur={() => setActiveField(null)}
              >
                <ProgramTypeSelect
                  value={formData.program}
                  onChange={(program) => setFormData((prev) => ({ ...prev, program }))}
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="discipline"
                className="flex items-center text-sm font-medium text-[#333333] mb-2"
              >
                <HiOutlineAcademicCap className="mr-2 text-[#7BC0F5]" />
                Discipline
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'discipline' ? 'focus' : 'blur'}
                onFocus={() => setActiveField('discipline')}
                onBlur={() => setActiveField(null)}
              >
                <DisciplineSelect
                  value={formData.discipline}
                  onChange={(discipline) => setFormData((prev) => ({ ...prev, discipline }))}
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div className="flex justify-between items-center pt-4" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-[#666666] hover:text-[#333333] hover:border-gray-300 transition-all font-medium cursor-pointer"
            >
              Back
            </motion.button>
            <motion.button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              whileHover={isFormValid && !isSubmitting ? { scale: 1.03 } : {}}
              whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
              className={`px-8 py-3 rounded-xl transition-all text-base md:text-lg font-medium min-w-[120px] ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-[#7BC0F5] to-[#5BAAE7] text-white shadow-md hover:shadow-lg cursor-pointer'
                  : 'bg-[#A7D7F9]/50 cursor-not-allowed text-white/70'
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

export default Step2School;
