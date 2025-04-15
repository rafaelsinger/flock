'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IncompleteUserOnboarding } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';
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

  const labelClasses = 'flex items-center text-sm font-medium text-[#333333] mb-2';

  return (
    <motion.div className="space-y-8" variants={pageVariants} initial="hidden" animate="visible">
      <OnboardingProgress currentStep={3} totalSteps={5} />

      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Where are you headed?</h1>
        <p className="text-lg text-[#666666]">
          Let your classmates know where you&apos;ll be living
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
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

          <motion.div variants={itemVariants}>
            <label className={`${labelClasses} mb-3`}>
              <IoMdPeople className="mr-2 text-[#F28B82]" />
              Looking for Roommates
            </label>
            <motion.div className="flex items-center px-4 py-3 rounded-lg border border-gray-200 hover:border-[#F9C5D1]/50 cursor-pointer">
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
              <label
                htmlFor="lookingForRoommate"
                className="ml-2 text-sm text-[#333333] cursor-pointer"
              >
                I&apos;m looking for roommate(s) in my postgrad destination
              </label>
            </motion.div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex justify-end space-x-4">
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
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Step3;
