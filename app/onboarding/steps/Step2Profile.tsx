"use client";

import type { UseFormReturn } from "react-hook-form";
import type { OnboardingFormData } from "@/validations/onboarding";
import { useOnboardingStore } from "@/store/onboarding.store";

interface Props {
  form: UseFormReturn<OnboardingFormData>;
}

export default function Step2Profile({ form }: Props) {
  const { goNext, goBack } = useOnboardingStore();
  const {
    register,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const headline = watch("headline") ?? "";
  const bio = watch("bio") ?? "";

  async function handleNext() {
    const valid = await trigger(["headline", "bio"]);
    if (!valid) return;
    goNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Tell people about yourself
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This appears on your public profile
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Headline <span className="text-red-500">*</span>
        </label>
        <input
          {...register("headline")}
          placeholder="e.g. Full-stack developer · React · Node.js"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900
                     placeholder:text-gray-400"
        />
        <div className="flex justify-between mt-1">
          {errors.headline ? (
            <p className="text-red-500 text-xs">{errors.headline.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">{headline.length}/80</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          {...register("bio")}
          placeholder="Tell people a bit about yourself and what you're working on…"
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900
                     placeholder:text-gray-400 resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.bio ? (
            <p className="text-red-500 text-xs">{errors.bio.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">{bio.length}/300</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={goBack}
          className="flex-1 py-2.5 border border-gray-200 text-sm font-medium
                     text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium
                     rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
