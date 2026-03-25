import { useOnboardingStore } from "@/store/onboarding.store";
import { motion } from "framer-motion";
export default function StepIndicator() {
  const { step, totalSteps } = useOnboardingStore();

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <motion.div
          key={s}
          layout
          className={`h-2 rounded-full transition-colors ${s === step ? "w-6 bg-indigo-600" : s < step ? "w-2 bg-indigo-300" : "w-2 bg-gray-200"}`}
        />
      ))}
      <span className="ml-2 text-xs text-gray-400">
        {step}/{totalSteps}
      </span>
    </div>
  );
}
