"use client";

import { useState } from "react";
import { FiGithub, FiStar, FiGitBranch, FiCode, FiLoader } from "react-icons/fi";
import { useVerifyGithub } from "@/hooks/useEvidence";

interface GithubRepoInputProps {
  skillId: string;
  value: string;
  onChange: (value: string) => void;
  onValidated: (isValid: boolean, summary?: any) => void;
}

interface RepoSummary {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  last_commit: string;
  commit_count: number;
}

export default function GithubRepoInput({
  skillId,
  value,
  onChange,
  onValidated,
}: GithubRepoInputProps) {
  const [repoSummary, setRepoSummary] = useState<RepoSummary | null>(null);
  const verifyGithub = useVerifyGithub(skillId);

  const handleVerify = async () => {
    if (!value) {
      return;
    }

    const result = await verifyGithub.mutateAsync(value);
    setRepoSummary(result);
    onValidated(true, result);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        GitHub Repository <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Link to a GitHub repository that demonstrates this skill
      </p>

      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setRepoSummary(null);
          }}
          placeholder="https://github.com/username/repo"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={!value || verifyGithub.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifyGithub.isPending ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            "Verify"
          )}
        </button>
      </div>

      {repoSummary && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <FiGithub className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{repoSummary.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {repoSummary.description || "No description"}
              </p>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4" />
                  {repoSummary.stars}
                </div>
                <div className="flex items-center gap-1">
                  <FiGitBranch className="w-4 h-4" />
                  {repoSummary.forks}
                </div>
                <div className="flex items-center gap-1">
                  <FiCode className="w-4 h-4" />
                  {repoSummary.language}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                {repoSummary.commit_count} commits • Last updated{" "}
                {new Date(repoSummary.last_commit).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
