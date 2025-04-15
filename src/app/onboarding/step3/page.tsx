'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { STATES_WITH_BOROUGHS } from '@/constants/location';
import { UserUpdate } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';
import { IoLocationOutline } from 'react-icons/io5';
import { MdOutlineLocationCity } from 'react-icons/md';
import { IoMdPeople } from 'react-icons/io';
import { CitySelect } from '@/components/Select/CitySelect';

const Step3: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as UserUpdate;

  const [formData, setFormData] = useState({
    country: '',
    state: '',
    city: '',
    boroughDistrict: '',
    lookingForRoommate: false,
    lat: 0,
    lng: 0,
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    setIsFormValid(
      Boolean(formData.country?.trim()) &&
        Boolean(formData.city?.trim()) &&
        formData.lat !== 0 &&
        formData.lng !== 0
    );
  }, [formData]);

  const updateOnboardingData = useMutation({
    mutationFn: (locationData: UserUpdate) => {
      const data: UserUpdate = {
        ...previousData,
        country: locationData.country,
        state: locationData.state,
        city: locationData.city,
        boroughDistrict: locationData.boroughDistrict,
        lookingForRoommate: locationData.lookingForRoommate,
        // lat: locationData.lat,
        // lng: locationData.lng,
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

  const showBoroughField =
    formData.country === 'USA' && STATES_WITH_BOROUGHS.includes(formData.state);

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
                    lng: location.lng,
                  }));
                }}
              />
            </motion.div>
          </motion.div>

          {showBoroughField && (
            <motion.div variants={itemVariants}>
              <label htmlFor="borough" className={labelClasses}>
                <IoLocationOutline className="mr-2 text-[#F28B82]" />
                Borough/Neighborhood <span className="text-[#666666] text-sm ml-1">(optional)</span>
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'borough' ? 'focus' : 'blur'}
              >
                <input
                  type="text"
                  id="borough"
                  value={formData.boroughDistrict}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, boroughDistrict: e.target.value }))
                  }
                  onFocus={() => setActiveField('borough')}
                  onBlur={() => setActiveField(null)}
                  className="w-full text-[#333] border border-gray-200 px-4 py-3 rounded-lg focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all"
                  placeholder="e.g. Brooklyn or Mission District"
                />
              </motion.div>
            </motion.div>
          )}

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
