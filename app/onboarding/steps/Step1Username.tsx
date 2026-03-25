"use client";

import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { OnboardingFormData } from "@/validations/onboarding";
import { useOnboardingStore } from "@/store/onboarding.store";
import { checkUserName } from "@/actions/onboarding";

interface Props {
  form: UseFormReturn<OnboardingFormData>;
}

export default function Step1Username({ form }: Props) {
  const { goNext, savedUsername, setSavedUsername } = useOnboardingStore();
  const {
    register,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const username = watch("username");

  const [availability, setAvailability] = useState<
    "idle" | "checking" | "available" | "taken"
  >(() => (savedUsername && savedUsername === username ? "available" : "idle"));

  useEffect(() => {
    if (savedUsername && username === savedUsername) {
      setAvailability("available");
      return;
    }

    if (!username || username.length < 3) {
      setAvailability("idle");
      return;
    }

    const formatOk = username.length <= 30;
    if (!formatOk) {
      setAvailability("idle");
      return;
    }

    setAvailability("checking");
    const timer = setTimeout(async () => {
      const result = await checkUserName(username);
      setAvailability(result.available ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [username, savedUsername]);

  async function handleNext() {
    const valid = await trigger("username");
    if (!valid) return;
    if (availability === "taken" || availability === "checking") return;
    setSavedUsername(username);
    goNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Choose your username
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This will be your public profile URL
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username <span className="text-red-500">*</span>
        </label>
        <div
          className="flex items-center border border-gray-200 rounded-lg overflow-hidden
                      focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent"
        >
          <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 shrink-0">
            skillmap.dev/u/
          </span>
          <input
            {...register("username")}
            placeholder="yourname"
            autoFocus
            className="flex-1 px-3 py-2.5 text-sm outline-none bg-white text-gray-900 placeholder:text-gray-400"
          />
          <span className="px-3">
            {availability === "checking" && (
              <span className="text-xs text-gray-400">checking…</span>
            )}
            {availability === "available" && (
              <span className="text-xs text-green-600 font-medium">
                available
              </span>
            )}
            {availability === "taken" && (
              <span className="text-xs text-red-500 font-medium">taken</span>
            )}
          </span>
        </div>

        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        )}
        {availability === "taken" && !errors.username && (
          <p className="text-red-500 text-xs mt-1">
            This username is already taken
          </p>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={availability === "taken" || availability === "checking"}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium
                   rounded-lg hover:bg-indigo-700 disabled:opacity-50
                   disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
