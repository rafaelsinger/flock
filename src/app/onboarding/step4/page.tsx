'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserUpdate } from '@/types/user';

type WorkFormData = {
  visibilityOptions: {
    company: boolean;
    title: boolean;
  };
};

type SchoolFormData = {
  visibilityOptions: {
    school: boolean;
    program: boolean;
  };
};

type FormData = WorkFormData | SchoolFormData;

const Step4: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as UserUpdate;

  const updateOnboardingData = useMutation({
    mutationFn: (visibilityData: UserUpdate) => {
      const data: UserUpdate = {
        ...previousData,
        visibilityOptions: {
          company: visibilityData.visibilityOptions?.company,
          title: visibilityData.visibilityOptions?.title,
          school: visibilityData.visibilityOptions?.school,
          program: visibilityData.visibilityOptions?.program,
        },
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);

      router.push('/onboarding/review');
    },
  });
  const [formData, setFormData] = useState<FormData>(
    previousData?.postGradType === 'work'
      ? {
          visibilityOptions: {
            company: true,
            title: true,
          },
        }
      : {
          visibilityOptions: {
            school: true,
            program: true,
          },
        }
  );

  useEffect(() => {
    if (!previousData || !previousData.postGradType) {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  if (!previousData || !previousData.postGradType) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOnboardingData.mutate(formData);
  };

  // Replace the onChange handlers with these type-safe versions
  const handleCompanySchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previousData.postGradType === 'work') {
      setFormData(
        (prev) =>
          ({
            ...prev,
            visibilityOptions: {
              ...(prev as WorkFormData).visibilityOptions,
              company: e.target.checked,
            },
          }) as WorkFormData
      );
    } else {
      setFormData(
        (prev) =>
          ({
            ...prev,
            visibilityOptions: {
              ...(prev as SchoolFormData).visibilityOptions,
              school: e.target.checked,
            },
          }) as SchoolFormData
      );
    }
  };

  const handleTitleProgramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previousData.postGradType === 'work') {
      setFormData(
        (prev) =>
          ({
            ...prev,
            visibilityOptions: {
              ...(prev as WorkFormData).visibilityOptions,
              title: e.target.checked,
            },
          }) as WorkFormData
      );
    } else {
      setFormData(
        (prev) =>
          ({
            ...prev,
            visibilityOptions: {
              ...(prev as SchoolFormData).visibilityOptions,
              program: e.target.checked,
            },
          }) as SchoolFormData
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Privacy Preferences</h1>
        <p className="text-[#666666]">Choose what information you want to share</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <span className="font-medium text-[#333333]">
                  Show {previousData.postGradType === 'work' ? 'Company' : 'School'}
                </span>
                <p className="text-sm text-[#666666]">
                  Display your {previousData.postGradType === 'work' ? 'company name' : 'school'} to
                  classmates
                </p>
              </div>
              <input
                type="checkbox"
                checked={
                  previousData.postGradType === 'work'
                    ? (formData as WorkFormData).visibilityOptions.company
                    : (formData as SchoolFormData).visibilityOptions.school
                }
                onChange={handleCompanySchoolChange}
                className="h-6 w-6 rounded border-gray-300 text-[#F9C5D1] focus:ring-[#F9C5D1] transition-colors cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <span className="font-medium text-[#333333]">
                  Show {previousData.postGradType === 'work' ? 'Role' : 'Program'}
                </span>
                <p className="text-sm text-[#666666]">
                  Display your {previousData.postGradType === 'work' ? 'role' : 'program'} to
                  classmates
                </p>
              </div>
              <input
                type="checkbox"
                checked={
                  previousData.postGradType === 'work'
                    ? (formData as WorkFormData).visibilityOptions.title
                    : (formData as SchoolFormData).visibilityOptions.program
                }
                onChange={handleTitleProgramChange}
                className="h-6 w-6 rounded border-gray-300 text-[#F9C5D1] focus:ring-[#F9C5D1] transition-colors cursor-pointer"
              />
            </label>
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
            className="px-6 py-2.5 rounded-lg bg-[#F28B82] hover:bg-[#E67C73] text-white transition-colors cursor-pointer"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step4;
