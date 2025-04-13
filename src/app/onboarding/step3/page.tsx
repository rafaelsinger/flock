"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OnboardingData } from "@/types/onboarding";

const Step3: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(["onboardingData"]) as OnboardingData;

  // Redirect if no previous data
  if (!previousData || !previousData.postGradType) {
    router.push("/onboarding/step1");
    return null;
  }

  const [formData, setFormData] = useState({
    country: "USA", // Default to USA for now
    state: "",
    city: "",
    borough: "", // Optional
  });

  const updateOnboardingData = useMutation({
    mutationFn: (locationData: OnboardingData["location"]) => {
      const data: OnboardingData = {
        ...previousData,
        location: locationData,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["onboardingData"], data);
      router.push("/onboarding/step4");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOnboardingData.mutate(formData);
  };

  // Common classes for better maintainability
  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-pointer";
  const labelClasses = "block text-sm font-medium text-[#333333] mb-2";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">
          Where are you headed?
        </h1>
        <p className="text-[#666666]">
          Let your classmates know where you&apos;ll be living
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="country" className={labelClasses}>
              Country
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className={inputClasses}
              required
            >
              <option value="USA">United States</option>
              {/* Add more countries as needed */}
            </select>
          </div>

          <div>
            <label htmlFor="state" className={labelClasses}>
              State
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              className={inputClasses}
              required
            >
              <option value="">Select a state</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="MA">Massachusetts</option>
              {/* Add more states */}
            </select>
          </div>

          <div>
            <label htmlFor="city" className={labelClasses}>
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className={inputClasses}
              placeholder="e.g. San Francisco"
              required
            />
          </div>

          <div>
            <label htmlFor="borough" className={labelClasses}>
              Borough/Neighborhood <span className="text-[#666666] text-sm">(optional)</span>
            </label>
            <input
              type="text"
              id="borough"
              value={formData.borough}
              onChange={(e) => setFormData(prev => ({ ...prev, borough: e.target.value }))}
              className={inputClasses}
              placeholder="e.g. Brooklyn or Mission District"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg text-[#666666] hover:text-[#333333] transition-colors cursor-pointer hover:bg-gray-50 active:bg-gray-100"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#F9C5D1] hover:bg-[#F28B82] text-white transition-colors cursor-pointer active:bg-[#E67C73]"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3; 