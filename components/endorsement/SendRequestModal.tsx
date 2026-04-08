"use client";

import { useState } from "react";
import { FiX, FiMail, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useSendEndorsementRequest } from "@/hooks/useEndorsementRequests";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface SendRequestModalProps {
  skill: Skill;
  onClose: () => void;
}

export default function SendRequestModal({ skill, onClose }: SendRequestModalProps) {
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 500);
  const sendRequest = useSendEndorsementRequest();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const { data: emailCheck, isLoading: isCheckingEmail } = useQuery({
    queryKey: ["check-email", debouncedEmail],
    queryFn: async () => {
      if (!debouncedEmail || !isValidEmail(debouncedEmail)) {
        return { exists: false, message: "" };
      }

      const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(debouncedEmail)}`);
      if (!response.ok) {
        return { exists: false, message: "" };
      }
      const result = await response.json();
      return result;
    },
    enabled: debouncedEmail.length > 0 && isValidEmail(debouncedEmail),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !isValidEmail(email)) {
      return;
    }

    await sendRequest.mutateAsync({
      skill_id: skill.id,
      endorser_email: email,
    });

    onClose();
  };

  const showValidation = debouncedEmail.length > 0 && debouncedEmail === email;
  const isEmailValid = isValidEmail(email);

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 border-2 border-blue-300 shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Request Endorsement
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              For: <span className="font-medium">{skill.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>


        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endorser Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="endorser@example.com"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                required
              />
              {showValidation && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingEmail ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : isEmailValid ? (
                    emailCheck?.exists ? (
                      <FiCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <FiCheck className="w-5 h-5 text-green-500" />
                    )
                  ) : (
                    <FiAlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {showValidation && (
              <div className="mt-2">
                {!isEmailValid ? (
                  <p className="text-xs text-red-600">
                    Please enter a valid email address
                  </p>
                ) : emailCheck?.exists ? (
                  <p className="text-xs text-green-600">
                    ✓ User found on SkillMap
                  </p>
                ) : (
                  <p className="text-xs text-blue-600">
                    Endorser will receive an invitation email
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email || !isEmailValid || sendRequest.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendRequest.isPending ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
