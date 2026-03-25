"use client";

import { OnboardingFormData, onboardingSchema } from "@/validations/onboarding";
import { useOnboardingStore } from "@/store/onboarding.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import StepIndicator from "./StepIndicator";
import Step1Username from "./steps/Step1Username";
import Step2Profile from "./steps/Step2Profile";
import Step3Availability from "./steps/Step3Availability";
import Step4Complete from "./steps/Step4Complete";

interface OnboardingWizardProps {
  role: string;
}

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function OnboardingWizard({ role }: OnboardingWizardProps) {
  const { step, setStep, setTotalSteps, draft } = useOnboardingStore();

  const showStep4 = role === "developer" || role === "endorser";

  useEffect(() => {
    const total = showStep4 ? 4 : 3;
    setTotalSteps(total);

    setStep(1);
    
  }, []);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: draft.username ?? "",
      headline: draft.headline ?? "",
      bio: draft.bio ?? "",
      location: draft.location ?? "",
      availability: draft.availability ?? "not_looking",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      useOnboardingStore.getState().setDraft(values);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        <div className="text-center mb-6">
          <span className="font-semibold text-gray-900 text-lg">SkillMap</span>
        </div>

        <StepIndicator />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {step === 1 && <Step1Username form={form} />}
            {step === 2 && <Step2Profile form={form} />}
            {step === 3 && <Step3Availability form={form} role={role} />}
            {step === 4 && showStep4 && (
              <Step4Complete form={form} role={role} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
