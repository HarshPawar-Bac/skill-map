import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingFormData } from "@/validations/onboarding";

interface OnboardingState {
  step: number;
  totalSteps: number;
  
  draft: Partial<OnboardingFormData>;

  savedUsername: string | null;

  setStep: (step: number) => void;
  setTotalSteps: (total: number) => void;
  goNext: () => void;
  goBack: () => void;
  setDraft: (data: Partial<OnboardingFormData>) => void;
  setSavedUsername: (username: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      step: 1,
      totalSteps: 4,
      draft: {
        username: "",
        headline: "",
        bio: "",
        location: "",
        availability: "not_looking",
      },
      savedUsername: null,

      setStep: (step) => set({ step }),
      setTotalSteps: (totalSteps) => set({ totalSteps }),

      goNext: () => {
        const { step, totalSteps } = get();
        set({ step: Math.min(step + 1, totalSteps) });
      },

      goBack: () => {
        const { step } = get();
        set({ step: Math.max(step - 1, 1) });
      },

      setDraft: (data) => {
        set((state) => ({ draft: { ...state.draft, ...data } }));
      },

      setSavedUsername: (username) => set({ savedUsername: username }),

      reset: () =>
        set({
          step: 1,
          draft: {
            username: "",
            headline: "",
            bio: "",
            location: "",
            availability: "not_looking",
          },
          savedUsername: null,
        }),
    }),
    {
      name: "onboarding-store",
    },
  ),
);
