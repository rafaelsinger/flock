'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserUpdate } from '@/types/user';
import { motion } from 'framer-motion';
import { FaUniversity } from 'react-icons/fa';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { OnboardingProgress } from '@/components';
import { PostGradType } from '@prisma/client';

const Step2School: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as UserUpdate;

  const [formData, setFormData] = useState({
    school: '',
    program: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const updateOnboardingData = useMutation({
    mutationFn: (schoolData: UserUpdate) => {
      const data: UserUpdate = {
        ...previousData,
        school: schoolData.school,
        program: schoolData.program,
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
    setIsFormValid(formData.school.trim() !== '' && formData.program.trim() !== '');
  }, [formData]);

  useEffect(() => {
    router.prefetch('/onboarding/step3');
  }, [router]);

  if (!previousData || previousData.postGradType !== PostGradType.school) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOnboardingData.mutate(formData);
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: '0 4px 6px rgba(167, 215, 249, 0.1)' },
    blur: { scale: 1, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' },
  };

  const pageVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div className="space-y-8" variants={pageVariants} initial="hidden" animate="visible">
      <OnboardingProgress currentStep={2} totalSteps={5} />

      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Tell us about your studies</h1>
        <p className="text-lg text-[#666666]">Share details about your upcoming program</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
              <input
                type="text"
                id="school"
                value={formData.school}
                onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
                onFocus={() => setActiveField('school')}
                onBlur={() => setActiveField(null)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#A7D7F9] focus:ring-2 focus:ring-[#A7D7F9]/20 outline-none transition-all text-[#333333]"
                placeholder="e.g. Stanford University"
                required
              />
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label
              htmlFor="program"
              className="flex items-center text-sm font-medium text-[#333333] mb-2"
            >
              <HiOutlineAcademicCap className="mr-2 text-[#7BC0F5]" />
              Program
            </label>
            <motion.div
              variants={inputVariants}
              animate={activeField === 'program' ? 'focus' : 'blur'}
            >
              <input
                type="text"
                id="program"
                value={formData.program}
                onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                onFocus={() => setActiveField('program')}
                onBlur={() => setActiveField(null)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#A7D7F9] focus:ring-2 focus:ring-[#A7D7F9]/20 outline-none transition-all text-[#333333]"
                placeholder="e.g. Master's in Computer Science"
                required
              />
            </motion.div>
          </motion.div>
        </div>

        <motion.div className="flex justify-end" variants={itemVariants}>
          <div className="flex space-x-4">
            <motion.button
              type="button"
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-lg text-[#666666] hover:text-[#333333] transition-colors cursor-pointer hover:bg-gray-50 active:bg-gray-100"
            >
              Back
            </motion.button>
            <motion.button
              type="submit"
              disabled={!isFormValid}
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
              className={`px-6 py-2.5 rounded-lg transition-all cursor-pointer ${
                isFormValid
                  ? 'bg-[#7BC0F5] hover:bg-[#5BAAE7] text-white shadow-sm hover:shadow'
                  : 'bg-[#A7D7F9]/50 cursor-not-allowed text-white/70'
              }`}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Step2School;
