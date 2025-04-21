'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IncompleteUserOnboarding } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress, OnboardingButton } from '@/components';
import { MdOutlineLocationCity } from 'react-icons/md';
import { IoMdPeople } from 'react-icons/io';
import { CitySelect } from '@/components/Select/CitySelect';

const Step3: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as IncompleteUserOnboarding;

  const [formData, setFormData] = useState({
    country: '',
    state: '',
    city: '',
    lookingForRoommate: false,
    lat: 0,
    lon: 0,
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsFormValid(
      Boolean(formData.country?.trim()) &&
        Boolean(formData.city?.trim()) &&
        formData.lat !== 0 &&
        formData.lon !== 0
    );
  }, [formData]);

  const updateOnboardingData = useMutation({
    mutationFn: (locationData: IncompleteUserOnboarding) => {
      const data: IncompleteUserOnboarding = {
        ...previousData,
        country: locationData.country,
        state: locationData.state,
        city: locationData.city,
        lookingForRoommate: locationData.lookingForRoommate,
        lat: locationData.lat,
        lon: locationData.lon,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);
      router.push('/onboarding/step4');
    },
  });

  useEffect(() => {
    if (!previousData || !previousData.postGradType) {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  useEffect(() => {
    router.prefetch('/onboarding/step4');
  }, [router]);

  if (!previousData || !previousData.postGradType) {
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

  const labelClasses = 'flex items-center text-sm font-medium text-[#333333] mb-2';

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

        <OnboardingProgress currentStep={4} totalSteps={6} />

        <motion.div className="text-center mb-10 mt-4" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
            Where are you headed?
          </h1>
          <p className="text-lg md:text-xl text-[#666666]">
            Let your classmates know where you&apos;ll be living
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <label htmlFor="city" className={labelClasses}>
                <MdOutlineLocationCity className="mr-2 text-[#F28B82]" />
                Location
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'city' ? 'focus' : 'blur'}
                onFocus={() => setActiveField('city')}
                onBlur={() => setActiveField(null)}
              >
                <CitySelect
                  value={formData.city}
                  onChange={(location) => {
                    setFormData((prev) => ({
                      ...prev,
                      city: location.city,
                      state: location.state,
                      country: location.country,
                      lat: location.lat,
                      lon: location.lon,
                    }));
                  }}
                />
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className="rounded-xl border-2 border-gray-200 hover:border-[#F9C5D1]/40 transition-all"
            >
              <label className={`flex items-center p-4 cursor-pointer`}>
                <input
                  type="checkbox"
                  id="lookingForRoommate"
                  checked={formData.lookingForRoommate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lookingForRoommate: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-[#F28B82] border-gray-300 rounded focus:ring-[#F9C5D1]"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <IoMdPeople className="mr-2 text-[#F28B82]" />
                    <span className="font-medium text-[#333333]">Looking for Roommates</span>
                  </div>
                  <p className="text-sm text-[#666666] mt-1 ml-6">
                    I&apos;m looking for roommate(s) in my postgrad destination
                  </p>
                </div>
              </label>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 pt-4"
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

export default Step3;
