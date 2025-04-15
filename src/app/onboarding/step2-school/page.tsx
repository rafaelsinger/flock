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
    programType: '',
    discipline: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const updateOnboardingData = useMutation({
    mutationFn: (schoolData: IncompleteUserOnboarding) => {
      const data: IncompleteUserOnboarding = {
        ...previousData,
        school: schoolData.school,
        program: program,
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
        Boolean(formData.programType?.trim())
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
              <SchoolSelect
                value={formData.school}
                onChange={(school) => setFormData((prev) => ({ ...prev, school }))}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label
              htmlFor="programType"
              className="flex items-center text-sm font-medium text-[#333333] mb-2"
            >
              <HiOutlineAcademicCap className="mr-2 text-[#7BC0F5]" />
              Program Type
            </label>
            <motion.div
              variants={inputVariants}
              animate={activeField === 'programType' ? 'focus' : 'blur'}
              onFocus={() => setActiveField('programType')}
              onBlur={() => setActiveField(null)}
            >
              <ProgramTypeSelect
                value={formData.programType}
                onChange={(programType) => setFormData((prev) => ({ ...prev, programType }))}
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
