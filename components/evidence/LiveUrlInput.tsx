"use client";

import { useState } from "react";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";
import { useVerifyUrl } from "@/hooks/useEvidence";

interface LiveUrlInputProps {
  skillId: string;
  value: string;
  onChange: (value: string) => void;
  onValidated: (isValid: boolean) => void;
}

export default function LiveUrlInput({
  skillId,
  value,
  onChange,
  onValidated,
}: LiveUrlInputProps) {
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const verifyUrl = useVerifyUrl(skillId);

  const handleVerify = async () => {
    if (!value) {
      setValidationResult({ valid: false, message: "Please enter a URL" });
      onValidated(false);
      return;
    }

    try {
      new URL(value);
    } catch {
      setValidationResult({ valid: false, message: "Invalid URL format" });
      onValidated(false);
      return;
    }

    const result = await verifyUrl.mutateAsync(value);

    if (result.valid) {
      setValidationResult({
        valid: true,
        message: "URL is accessible",
      });
      onValidated(true);
    } else {
      setValidationResult({
        valid: false,
        message: `URL returned ${result.status} ${result.statusText}`,
      });
      onValidated(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Live URL <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Provide a link to your deployed project, portfolio, or live demo
      </p>

      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setValidationResult(null);
          }}
          placeholder="https://example.com"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={!value || verifyUrl.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifyUrl.isPending ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            "Verify"
          )}
        </button>
      </div>

      {validationResult && (
        <div
          className={`flex items-center gap-2 mt-2 text-sm ${
            validationResult.valid ? "text-green-600" : "text-red-600"
          }`}
        >
          {validationResult.valid ? (
            <FiCheck className="w-4 h-4" />
          ) : (
            <FiX className="w-4 h-4" />
          )}
          {validationResult.message}
        </div>
      )}
    </div>
  );
}
