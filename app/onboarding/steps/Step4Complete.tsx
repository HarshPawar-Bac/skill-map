"use client";

import type { UseFormReturn } from "react-hook-form";
import type { OnboardingFormData } from "@/validations/onboarding";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useAuthStore } from "@/store/auth.store";
import { completeOnboarding } from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiCheckCircle, FiGithub, FiZap } from "react-icons/fi";

interface Props {
  form: UseFormReturn<OnboardingFormData>;
  role: string;
}

const ROLE_LABEL: Record<string, string> = {
  developer: "Developer",
  endorser: "Endorser",
};

export default function Step4Complete({ form, role }: Props) {
  const { goBack, reset: resetOnboarding } = useOnboardingStore();
  const { refreshProfile } = useAuthStore();
  const router = useRouter();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

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

    toast.success("Welcome to SkillMap! Your profile is ready 🎉");

    router.push(
      (result as { destination?: string }).destination ??
        "/dashboard/developer/skills",
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          You&apos;re all set!
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Your {ROLE_LABEL[role] ?? "SkillMap"} profile is ready to go
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
          <FiCheckCircle className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-sm font-medium text-gray-900">Profile created</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Username, headline, and availability saved
            </p>
          </div>
        </div>

        {role === "developer" && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <FiZap className="text-indigo-600 shrink-0" size={18} />
            <div>
              <p className="text-sm font-medium text-gray-900">Next step</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Add your first skill and upload evidence from your dashboard
              </p>
            </div>
          </div>
        )}

        {role === "endorser" && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <FiZap className="text-indigo-600 shrink-0" size={18} />
            <div>
              <p className="text-sm font-medium text-gray-900">Next step</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Pending endorsement requests will appear in your dashboard
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
          <FiGithub className="text-gray-500 shrink-0" size={18} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Connect GitHub later
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              You can link your GitHub account from Settings at any time
            </p>
          </div>
        </div>
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
          onClick={() => handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium
                     rounded-lg hover:bg-indigo-700 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Setting up…" : "SetUp Profile →"}
        </button>
      </div>
    </div>
  );
}
