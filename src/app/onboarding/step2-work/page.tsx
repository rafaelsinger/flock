'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { INDUSTRIES } from '@/constants/industries';
import { IncompleteUserOnboarding } from '@/types/user';
import { motion } from 'framer-motion';
import { BsBriefcase, BsBuilding, BsPerson } from 'react-icons/bs';
import { OnboardingProgress, OnboardingButton } from '@/components';
import { PostGradType } from '@prisma/client';
import { CURRENT_CLASS_YEAR } from '@/constants/general';

const Step2Work: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as IncompleteUserOnboarding;
  const isIntern = previousData?.classYear != CURRENT_CLASS_YEAR;

  // Adjust form fields based on user type - now we use the same fields for both
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    industry: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Different validation based on user type
  useEffect(() => {
    setIsFormValid(
      formData.company?.trim() !== '' && formData.title?.trim() !== '' && formData.industry !== ''
    );
  }, [formData]);

  const updateOnboardingData = useMutation({
    mutationFn: (workData: IncompleteUserOnboarding) => {
      // Prepare data differently based on user type
      const data: IncompleteUserOnboarding = {
        ...previousData,
        company: workData.company,
        title: workData.title,
        industry: workData.industry,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);
      router.push('/onboarding/step3');
    },
  });

  useEffect(() => {
    const validPostGradType = isIntern ? 'internship' : PostGradType.work;
    if (!previousData || previousData.postGradType !== validPostGradType) {
      router.push('/onboarding/step1');
    }
  }, [previousData, router, isIntern]);

  useEffect(() => {
    router.prefetch('/onboarding/step3');
  }, [router]);

  const validPostGradType = isIntern ? 'internship' : PostGradType.work;
  if (!previousData || previousData.postGradType !== validPostGradType) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateOnboardingData.mutate(formData);
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: '0 4px 6px rgba(249, 197, 209, 0.1)' },
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
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F9C5D1] via-[#F28B82] to-[#C06C84]"></div>

        <OnboardingProgress currentStep={3} totalSteps={6} />

        <motion.div className="text-center mb-10 mt-4" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
            {isIntern ? 'Tell us about your internship' : 'Tell us about your job'}
          </h1>
          <p className="text-lg md:text-xl text-[#666666]">
            {isIntern
              ? 'Share details about your upcoming summer experience'
              : 'Share details about your upcoming role'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <label
                htmlFor="company"
                className="flex items-center text-sm font-medium text-[#333333] mb-2"
              >
                <BsBuilding className="mr-2 text-[#F28B82]" />
                {isIntern ? 'Internship Company' : 'Company'}
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'company' ? 'focus' : 'blur'}
              >
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  onFocus={() => setActiveField('company')}
                  onBlur={() => setActiveField(null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all text-[#333333]"
                  placeholder={isIntern ? 'e.g. Google' : 'e.g. Stripe'}
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="title"
                className="flex items-center text-sm font-medium text-[#333333] mb-2"
              >
                <BsPerson className="mr-2 text-[#F28B82]" />
                {isIntern ? 'Internship Title' : 'Role'}
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'title' ? 'focus' : 'blur'}
              >
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  onFocus={() => setActiveField('title')}
                  onBlur={() => setActiveField(null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all text-[#333333]"
                  placeholder={
                    isIntern ? 'e.g. Software Engineering Intern' : 'e.g. Software Engineer'
                  }
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="industry"
                className="flex items-center text-sm font-medium text-[#333333] mb-2"
              >
                <BsBriefcase className="mr-2 text-[#F28B82]" />
                Industry
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'industry' ? 'focus' : 'blur'}
              >
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                  onFocus={() => setActiveField('industry')}
                  onBlur={() => setActiveField(null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all cursor-pointer hover:border-[#F9C5D1]/50 text-[#333333]"
                  required
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4"
            variants={itemVariants}
          >
            <OnboardingButton type="button" variant="secondary" onClick={() => router.back()}>
              Back
            </OnboardingButton>
            <OnboardingButton
              type="submit"
              variant="primary"
              disabled={!isFormValid || isSubmitting}
              isLoading={isSubmitting}
            >
              Continue
            </OnboardingButton>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Step2Work;
