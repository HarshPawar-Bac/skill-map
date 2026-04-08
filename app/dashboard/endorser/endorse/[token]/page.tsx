"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiExternalLink, FiVideo, FiCode, FiZap, FiTrendingUp} from "react-icons/fi";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import RatingSelector  from "@/components/endorser/RatingSelector";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function EndorsePage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [codeQualityRating, setCodeQualityRating] = useState(0);
  const [problemSolvingRating, setProblemSolvingRating] = useState(0);
  const [proficiencyDepthRating, setProficiencyDepthRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(false);
  const [assessment, setAssessment] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["endorse", token],
    queryFn: async () => {
      const response = await fetch(`/api/endorser/endorse/${token}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch request");
      }
      return response.json();
    },
  });

  console.log('endorsement data:', data)

  const submitEndorsement = useMutation({
    mutationFn: async (action: "accept" | "decline") => {
      const response = await fetch(`/api/endorser/endorse/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          code_quality_rating: action === "accept" ? codeQualityRating : undefined,
          problem_solving_rating: action === "accept" ? problemSolvingRating : undefined,
          proficiency_depth_rating: action === "accept" ? proficiencyDepthRating : undefined,
          would_recommend: action === "accept" ? wouldRecommend : undefined,
          assessment: action === "accept" ? assessment : undefined,
          decline_reason: action === "decline" ? assessment : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit");
      }

      return response.json();
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ["endorser-requests"] });
      toast.success(
        action === "accept"
          ? "Endorsement submitted successfully!"
          : "Request declined"
      );
      router.push("/dashboard/endorser/endorsements");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAccept = () => {
    if (codeQualityRating === 0 || problemSolvingRating === 0 || proficiencyDepthRating === 0) {
      toast.error("Please rate all three categories");
      return;
    }
    if (assessment.length < 50) {
      toast.error("Assessment must be at least 50 characters");
      return;
    }
    submitEndorsement.mutate("accept");
  };

  const handleDecline = () => {
    if (confirm("Are you sure you want to decline this endorsement request?")) {
      submitEndorsement.mutate("decline");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 mt-4">Loading request...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600">{(error as Error).message}</p>
        <Link
          href="/dashboard/endorser/endorsements"
          className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600">Failed to load endorsement request</p>
        <Link
          href="/dashboard/endorser/endorsements"
          className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>
      </div>
    );
  }

  const { skill, evidence, developer } = data.data;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link
          href="/dashboard/endorser/endorsements"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Review Endorsement Request
        </h1>
        <p className="text-gray-600 mt-2">
          Review the evidence and provide your endorsement
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Developer</h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
            {developer.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {developer.username}
            </h3>
            {developer.headline && (
              <p className="text-sm text-gray-600 mt-1">{developer.headline}</p>
            )}
            {developer.bio && (
              <p className="text-sm text-gray-600 mt-2">{developer.bio}</p>
            )}
            {developer.location && (
              <p className="text-xs text-gray-500 mt-2">{developer.location}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Skill</h2>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{skill.name}</h3>
          <p className="text-sm text-indigo-600 mt-1">{skill.category}</p>
          <p className="text-sm text-gray-600 mt-3">{skill.description}</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Live Site
          </h2>
          <div className="space-y-4">
            <a
              href={evidence.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-2"
            >
              {evidence.live_url}
              <FiExternalLink className="w-4 h-4" />
            </a>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <iframe
                src={evidence.live_url}
                className="w-full h-96"
                title="Live Site Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            GitHub Repository
          </h2>
          <a
            href={evidence.github_repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            {evidence.github_repo_url}
            <FiExternalLink className="w-4 h-4" />
          </a>

          {evidence.github_summary && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Repository Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {evidence.github_summary.name && (
                  <div>
                    <span className="text-gray-600">Repository Name:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {evidence.github_summary.name}
                    </span>
                  </div>
                )}
                {evidence.github_summary.language && (
                  <div>
                    <span className="text-gray-600">Primary Language:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {evidence.github_summary.language}
                    </span>
                  </div>
                )}
                {evidence.github_summary.stars !== undefined && (
                  <div>
                    <span className="text-gray-600">Stars:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {evidence.github_summary.stars}
                    </span>
                  </div>
                )}
                {evidence.github_summary.forks !== undefined && (
                  <div>
                    <span className="text-gray-600">Forks:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {evidence.github_summary.forks}
                    </span>
                  </div>
                )}
                {evidence.github_summary.lastpush && (
                  <div>
                    <span className="text-gray-600">Last Push:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(
                        evidence.github_summary.lastpush,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {evidence.github_summary.commitCount !== undefined && (
                  <div>
                    <span className="text-gray-600">Commit Count:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {
                        evidence.github_summary.commitCount
                      }
                    </span>
                  </div>
                )}
              </div>
              {evidence.github_summary.description && (
                <p className="mt-3 text-sm text-gray-700">
                  {evidence.github_summary.description}
                </p>
              )}
            </div>
          )}
        </div>


        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Video Demo
          </h2>
          {evidence.video_url ? (
            <video
              controls
              className="w-full rounded-lg"
              src={evidence.video_url}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <FiVideo className="w-5 h-5" />
              <span>Video not available</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Your Endorsement
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <RatingSelector
            value={codeQualityRating}
            onChange={setCodeQualityRating}
            label="Code Quality"
            icon={FiCode}
          />
          <RatingSelector
            value={problemSolvingRating}
            onChange={setProblemSolvingRating}
            label="Problem Solving Approach"
            icon={FiZap}
          />
          <RatingSelector
            value={proficiencyDepthRating}
            onChange={setProficiencyDepthRating}
            label="Proficiency Depth"
            icon={FiTrendingUp}
          />
        </div>

        {/* Would Recommend Toggle */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                Would Recommend for Hiring
              </span>
            </div>
          </label>
        </div>

        {/* Written Assessment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Written Assessment <span className="text-red-500">*</span>
          </label>
          <textarea
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            rows={6}
            placeholder="Provide a detailed assessment explaining your ratings. This will be displayed publicly on the developer's profile. (Minimum 50 characters)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Minimum 50 characters required
            </p>
            <p
              className={`text-xs ${assessment.length >= 50 ? "text-green-600" : "text-gray-500"}`}
            >
              {assessment.length} / 50
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleDecline}
            disabled={submitEndorsement.isPending}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={
              submitEndorsement.isPending ||
              codeQualityRating === 0 ||
              problemSolvingRating === 0 ||
              proficiencyDepthRating === 0 ||
              assessment.length < 50
            }
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitEndorsement.isPending
              ? "Submitting..."
              : "Submit Endorsement"}
          </button>
        </div>
      </div>
    </div>
  );
}
