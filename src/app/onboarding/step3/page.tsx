"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OnboardingData } from "@/types/onboarding";

// States that support borough/neighborhood selection
const STATES_WITH_BOROUGHS = ["NY", "CA", "TX", "FL", "IL", "MA"];

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
].sort((a, b) => a.label.localeCompare(b.label));

const COUNTRIES = [
  { value: "USA", label: "United States" },
  { value: "CAN", label: "Canada" },
  { value: "GBR", label: "United Kingdom" },
  { value: "AUS", label: "Australia" },
  { value: "DEU", label: "Germany" },
  { value: "FRA", label: "France" },
  { value: "JPN", label: "Japan" },
  { value: "CHN", label: "China" },
  { value: "IND", label: "India" },
  { value: "BRA", label: "Brazil" },
  // Add more countries as needed
].sort((a, b) => a.label.localeCompare(b.label));

const Step3: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData([
    "onboardingData",
  ]) as OnboardingData;

  const [formData, setFormData] = useState({
    country: "USA",
    state: "",
    city: "",
    borough: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(
      formData.country.trim() !== "" &&
        (formData.country !== "USA" || formData.state.trim() !== "") &&
        formData.city.trim() !== ""
    );
  }, [formData]);

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

  useEffect(() => {
    if (!previousData || !previousData.postGradType) {
      router.push("/onboarding/step1");
    }
  }, [previousData, router]);

  if (!previousData || !previousData.postGradType) {
    return null;
  }

  const showStateField = formData.country === "USA";
  const showBoroughField =
    formData.country === "USA" && STATES_WITH_BOROUGHS.includes(formData.state);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locationData = {
      ...formData,
      // Only include state for USA
      state: showStateField ? formData.state : "",
      // Only include borough for specific states
      borough: showBoroughField ? formData.borough : "",
    };
    updateOnboardingData.mutate(locationData);
  };

  // Common classes for better maintainability
  const inputClasses =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-pointer text-[#333333]";
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  country: e.target.value,
                  // Reset state and borough when country changes
                  state: "",
                  borough: "",
                }))
              }
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
          </div>

          {showStateField && (
            <div>
              <label htmlFor="state" className={labelClasses}>
                State
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    state: e.target.value,
                    // Reset borough when state changes
                    borough: "",
                  }))
                }
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
            </div>
          )}

          <div>
            <label htmlFor="city" className={labelClasses}>
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              className={inputClasses}
              placeholder="e.g. San Francisco"
              required
            />
          </div>

          {showBoroughField && (
            <div>
              <label htmlFor="borough" className={labelClasses}>
                Borough/Neighborhood{" "}
                <span className="text-[#666666] text-sm">(optional)</span>
              </label>
              <input
                type="text"
                id="borough"
                value={formData.borough}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, borough: e.target.value }))
                }
                className={inputClasses}
                placeholder="e.g. Brooklyn or Mission District"
              />
            </div>
          )}
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
            disabled={!isFormValid}
            className={`px-6 py-2.5 rounded-lg transition-colors cursor-pointer ${
              isFormValid
                ? "bg-[#F28B82] hover:bg-[#E67C73] text-white"
                : "bg-[#F9C5D1]/50 cursor-not-allowed text-white/70"
            }`}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3;
