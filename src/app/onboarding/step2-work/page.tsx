'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { INDUSTRIES } from '@/constants/industries';
import { IncompleteUserOnboarding } from '@/types/user';
import { motion } from 'framer-motion';
import { BsBriefcase, BsBuilding, BsPerson } from 'react-icons/bs';
import { OnboardingProgress } from '@/components';
import { PostGradType } from '@prisma/client';

const Step2Work: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as IncompleteUserOnboarding;

  const [formData, setFormData] = useState({
    company: '',
    title: '',
    industry: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsFormValid(
      formData.company.trim() !== '' && formData.title.trim() !== '' && formData.industry !== ''
    );
  }, [formData]);

  const updateOnboardingData = useMutation({
    mutationFn: (workData: IncompleteUserOnboarding) => {
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
    if (!previousData || previousData.postGradType !== PostGradType.work) {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  useEffect(() => {
    router.prefetch('/onboarding/step3');
  }, [router]);

  if (!previousData || previousData.postGradType !== PostGradType.work) {
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
            Tell us about your job
          </h1>
          <p className="text-lg md:text-xl text-[#666666]">
            Share details about your upcoming role
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
                Company
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'company' ? 'focus' : 'blur'}
              >
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  onFocus={() => setActiveField('company')}
                  onBlur={() => setActiveField(null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all text-[#333333]"
                  placeholder="e.g. Stripe"
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="role"
                className="flex items-center text-sm font-medium text-[#333333] mb-2"
              >
                <BsPerson className="mr-2 text-[#F28B82]" />
                Role
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'role' ? 'focus' : 'blur'}
              >
                <input
                  type="text"
                  id="role"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  onFocus={() => setActiveField('role')}
                  onBlur={() => setActiveField(null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all text-[#333333]"
                  placeholder="e.g. Software Engineer"
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

          <motion.div className="flex justify-between items-center pt-4" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-[#666666] hover:text-[#333333] hover:border-gray-300 transition-all font-medium"
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

export default Step2Work;
