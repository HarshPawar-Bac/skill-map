"use client";

import type { UseFormReturn } from "react-hook-form";
import type { OnboardingFormData } from "@/validations/onboarding";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useAuthStore } from "@/store/auth.store";
import { completeOnboarding } from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  form: UseFormReturn<OnboardingFormData>;
  role: string;
}

export default function Step3Availability({ form, role }: Props) {
  const {
    goNext,
    goBack,
    step,
    totalSteps,
    reset: resetOnboarding,
  } = useOnboardingStore();

  const { refreshProfile } = useAuthStore();
  const router = useRouter();

  const {
    register,
    watch,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const selected = watch("availability");
  const isLastStep = step === totalSteps;

  async function onSubmit(data: OnboardingFormData) {
    const result = await completeOnboarding(data);

    if (result.error) {
      const msg =
        typeof result.error === "string"
          ? result.error
          : ((Object.values(result.error).flat()[0] as string) ??
            "Something went wrong");
      toast.error(msg);
      return;
    }

    resetOnboarding();
    await refreshProfile();

    toast.success("Profile setup complete! Welcome to SkillMap 🎉");
    router.push(
      (result as { destination?: string }).destination ??
        "/dashboard/developer/skills",
    );
  }

  async function handleContinue() {
    const valid = await trigger(["availability", "location"]);
    if (!valid) return;

    if (isLastStep) {
      handleSubmit(onSubmit)();
    } else {
      goNext();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Your availability
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Employers use this to find the right candidates
        </p>
      </div>

      <div className="space-y-2">
        {[
          {
            value: "open",
            label: "Open to work",
            description: "Actively looking for new opportunities",
          },
          {
            value: "employed",
            label: "Employed",
            description: "Currently working, open to interesting offers",
          },
          {
            value: "not_looking",
            label: "Not looking",
            description: "Not interested right now",
          },
        ].map((option) => (
          <label
            key={option.value}
            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer
                        transition-all ${
                          selected === option.value
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
          >
            <input
              {...register("availability")}
              type="radio"
              value={option.value}
              className="mt-0.5 accent-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {option.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {option.description}
              </p>
            </div>
          </label>
        ))}
        {errors.availability && (
          <p className="text-red-500 text-xs mt-1">
            {errors.availability.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <input
          {...register("location")}
          placeholder="e.g. Mumbai, India"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900
                     placeholder:text-gray-400"
        />
        {errors.location && (
          <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={goBack}
          disabled={isSubmitting}
          className="flex-1 py-2.5 border border-gray-200 text-sm font-medium
                     text-gray-700 rounded-lg hover:bg-gray-50 transition-colors
                     disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium
                     rounded-lg hover:bg-indigo-700 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? "Setting up…"
            : isLastStep
              ? "Complete setup"
              : "Continue"}
        </button>
      </div>
    </div>
  );
}
