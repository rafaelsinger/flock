"use client";

import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BsBriefcase } from "react-icons/bs";
import { LuGraduationCap } from "react-icons/lu";
import type { OnboardingData } from "@/types/onboarding";

const ReviewPage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(["onboardingData"]) as OnboardingData;

  useEffect(() => {
    if (!data || !data.postGradType) {
      router.push("/onboarding/step1");
    }
  }, [data, router]);

  // If no data, render nothing while redirect happens
  if (!data || !data.postGradType) {
    return null;
  }

  const finalizeOnboarding = useMutation({
    mutationFn: (finalData: OnboardingData) => {
      // This would be replaced with an actual API call
      return Promise.resolve(finalData);
    },
    onSuccess: () => {
      // Clear onboarding data from cache
      queryClient.removeQueries(["onboardingData"]);
      router.push("/directory");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    finalizeOnboarding.mutate(data);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">
          Review Your Profile
        </h1>
        <p className="text-[#666666]">
          Make sure everything looks good before finishing
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 space-y-6">
          {/* Post-grad Status */}
          <div className="flex items-center space-x-3 pb-4 border-b">
            {data.postGradType === "work" ? (
              <BsBriefcase className="text-[#F28B82] text-xl" />
            ) : (
              <LuGraduationCap className="text-[#A7D7F9] text-xl" />
            )}
            <h2 className="text-xl font-medium text-[#333333]">
              {data.postGradType === "work" ? "Work" : "Education"}
            </h2>
          </div>

          {/* Details */}
          {data.postGradType === "work" && data.work && (
            <div className="space-y-2">
              <p className="text-[#333333]">
                <span className="font-medium">Company:</span>{" "}
                {data.work.company}
              </p>
              <p className="text-[#333333]">
                <span className="font-medium">Role:</span> {data.work.role}
              </p>
              <p className="text-[#333333]">
                <span className="font-medium">Industry:</span>{" "}
                {data.work.industry}
              </p>
            </div>
          )}

          {data.postGradType === "school" && data.school && (
            <div className="space-y-2">
              <p className="text-[#333333]">
                <span className="font-medium">School:</span> {data.school.name}
              </p>
              <p className="text-[#333333]">
                <span className="font-medium">Program:</span>{" "}
                {data.school.program}
              </p>
            </div>
          )}

          {/* Location */}
          {data.location && (
            <div className="pt-4 border-t space-y-2">
              <h3 className="font-medium text-[#333333]">Location</h3>
              <p className="text-[#333333]">
                {data.location.city}, {data.location.state}
                {data.location.borough && `, ${data.location.borough}`}
              </p>
            </div>
          )}

          {/* Privacy Settings */}
          <div className="pt-4 border-t space-y-2">
            <h3 className="font-medium text-[#333333]">Visibility Settings</h3>
            <ul className="space-y-1 text-[#666666]">
              {data.visibility?.showEmail && (
                <li>• Email visible to classmates</li>
              )}
              {data.visibility?.showPhone && (
                <li>• Phone number visible to classmates</li>
              )}
              {data.visibility?.showLocation && (
                <li>• Location visible on map</li>
              )}
              {data.visibility?.showCompanyRole && (
                <li>
                  •{" "}
                  {data.postGradType === "work"
                    ? "Company & role"
                    : "School & program"}{" "}
                  visible to classmates
                </li>
              )}
            </ul>
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
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-[#F28B82] hover:bg-[#E67C73] text-white transition-colors cursor-pointer"
          >
            Finish & Enter Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
