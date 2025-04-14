'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { INDUSTRIES } from '@/constants/industries';
import { UserUpdate } from '@/types/user';
import { motion } from 'framer-motion';
import { BsBriefcase, BsBuilding, BsPerson } from 'react-icons/bs';
import { OnboardingProgress } from '@/components';
import { PostGradType } from '@prisma/client';

const Step2Work: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as UserUpdate;

  const [formData, setFormData] = useState({
    company: '',
    title: '',
    industry: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    setIsFormValid(
      formData.company.trim() !== '' && formData.title.trim() !== '' && formData.industry !== ''
    );
  }, [formData]);

  const updateOnboardingData = useMutation({
    mutationFn: (workData: UserUpdate) => {
      const data: UserUpdate = {
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
    updateOnboardingData.mutate(formData);
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: '0 4px 6px rgba(249, 197, 209, 0.1)' },
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
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Tell us about your job</h1>
        <p className="text-lg text-[#666666]">Share details about your upcoming role</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all text-[#333333]"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all text-[#333333]"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all cursor-pointer hover:border-[#F9C5D1]/50 text-[#333333]"
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
                  ? 'bg-[#F28B82] hover:bg-[#E67C73] text-white shadow-sm hover:shadow'
                  : 'bg-[#F9C5D1]/50 cursor-not-allowed text-white/70'
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

export default Step2Work;
