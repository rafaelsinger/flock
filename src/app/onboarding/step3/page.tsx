'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { US_STATES, COUNTRIES, STATES_WITH_BOROUGHS } from '@/constants/location';
import { UserUpdate } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';
import { IoLocationOutline } from 'react-icons/io5';
import { MdOutlineLocationCity } from 'react-icons/md';
import { TbMap2 } from 'react-icons/tb';
import { HiOutlineGlobeAlt } from 'react-icons/hi';

const Step3: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as UserUpdate;

  const [formData, setFormData] = useState({
    country: 'USA',
    state: '',
    city: '',
    boroughDistrict: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    setIsFormValid(
      formData.country.trim() !== '' &&
        (formData.country !== 'USA' || formData.state.trim() !== '') &&
        formData.city.trim() !== ''
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

  if (!previousData || !previousData.postGradType) {
    return null;
  }

  const showStateField = formData.country === 'USA';
  const showBoroughField =
    formData.country === 'USA' && STATES_WITH_BOROUGHS.includes(formData.state);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locationData = {
      ...formData,
      // Only include state for USA
      state: showStateField ? formData.state : '',
      // Only include borough for specific states
      borough: showBoroughField ? formData.boroughDistrict : '',
    };
    updateOnboardingData.mutate(locationData);
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

  // Common classes for better maintainability
  const inputClasses =
    'w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all hover:border-[#F9C5D1]/50 cursor-pointer text-[#333333]';
  const labelClasses = 'flex items-center text-sm font-medium text-[#333333] mb-2';

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <OnboardingProgress currentStep={3} totalSteps={4} />

      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Where are you headed?</h1>
        <p className="text-lg text-[#666666]">
          Let your classmates know where you&apos;ll be living
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <label htmlFor="country" className={labelClasses}>
              <HiOutlineGlobeAlt className="mr-2 text-[#F28B82]" />
              Country
            </label>
            <motion.div
              variants={inputVariants}
              animate={activeField === 'country' ? 'focus' : 'blur'}
            >
              <select
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    country: e.target.value,
                    // Reset state and borough when country changes
                    state: '',
                    boroughDistrict: '',
                  }))
                }
                onFocus={() => setActiveField('country')}
                onBlur={() => setActiveField(null)}
                className={inputClasses}
                required
              >
                <option value="">Select a country</option>
                {COUNTRIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </motion.div>
          </motion.div>

          {showStateField && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <label htmlFor="state" className={labelClasses}>
                <TbMap2 className="mr-2 text-[#F28B82]" />
                State
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'state' ? 'focus' : 'blur'}
              >
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: e.target.value,
                      // Reset borough when state changes
                      boroughDistrict: '',
                    }))
                  }
                  onFocus={() => setActiveField('state')}
                  onBlur={() => setActiveField(null)}
                  className={inputClasses}
                  required
                >
                  <option value="">Select a state</option>
                  {US_STATES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </motion.div>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <label htmlFor="city" className={labelClasses}>
              <MdOutlineLocationCity className="mr-2 text-[#F28B82]" />
              City
            </label>
            <motion.div
              variants={inputVariants}
              animate={activeField === 'city' ? 'focus' : 'blur'}
            >
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                onFocus={() => setActiveField('city')}
                onBlur={() => setActiveField(null)}
                className={inputClasses}
                placeholder="e.g. San Francisco"
                required
              />
            </motion.div>
          </motion.div>

          {showBoroughField && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
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
                  className={inputClasses}
                  placeholder="e.g. Brooklyn or Mission District"
                />
              </motion.div>
            </motion.div>
          )}
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
