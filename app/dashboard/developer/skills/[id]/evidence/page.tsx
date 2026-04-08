"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { useEvidence, useSaveEvidence, useDeleteEvidence } from "@/hooks/useEvidence";
import { useSkills } from "@/hooks/useSkills";
import LiveUrlInput from "@/components/evidence/LiveUrlInput";
import GithubRepoInput from "@/components/evidence/GithubRepoInput";
import VideoUpload from "@/components/evidence/VideoUpload";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EvidencePage({ params }: PageProps) {
  const { id: skillId } = use(params);
  const router = useRouter();

  const { data: skills } = useSkills();
  const { data: evidence, isLoading } = useEvidence(skillId);
  const saveEvidence = useSaveEvidence(skillId);
  const deleteEvidence = useDeleteEvidence(skillId);

  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [videoS3Key, setVideoS3Key] = useState(""); 
  const [videoUrl, setVideoUrl] = useState("");
  const [isLiveUrlValid, setIsLiveUrlValid] = useState(false);
  const [isGithubValid, setIsGithubValid] = useState(false);
  const [githubSummary, setGithubSummary] = useState<any>(null);

  const skill = skills?.find((s) => s.id === skillId);

  useEffect(() => {
    if (evidence) {
      setLiveUrl(evidence.live_url);
      setGithubUrl(evidence.github_repo_url);
      setVideoS3Key(evidence.video_s3_key);
      setVideoUrl(evidence.video_url || "");
      setGithubSummary(evidence.github_summary);
      setIsLiveUrlValid(evidence.live_url_valid || true);
      setIsGithubValid(true);
    }
  }, [evidence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLiveUrlValid) {
      return;
    }

    if (!isGithubValid) {
      return;
    }

    if (!videoS3Key) {
      return;
    }

    await saveEvidence.mutateAsync({
      live_url: liveUrl,
      live_url_valid: isLiveUrlValid,
      github_repo_url: githubUrl,
      github_summary: githubSummary,
      video_s3_key: videoS3Key,
      video_url: videoUrl || null,
    });

    router.push("/dashboard/developer/skills");
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this evidence?")) {
      await deleteEvidence.mutateAsync();
      router.push("/dashboard/developer/skills");
    }
  };

  const canSubmit = isLiveUrlValid && isGithubValid && videoS3Key && !saveEvidence.isPending;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 mt-4">Loading evidence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/developer/skills"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Skills
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Upload Evidence</h1>
        {skill && (
          <p className="text-gray-600 mt-2">
            Provide evidence for: <span className="font-semibold">{skill.name}</span>
          </p>
        )}
      </div>


      <form onSubmit={handleSubmit} className="space-y-8">
 
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <LiveUrlInput
            skillId={skillId}
            value={liveUrl}
            onChange={setLiveUrl}
            onValidated={setIsLiveUrlValid}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <GithubRepoInput
            skillId={skillId}
            value={githubUrl}
            onChange={setGithubUrl}
            onValidated={(isValid, summary) => {
              setIsGithubValid(isValid);
              if (summary) {
                setGithubSummary(summary);
              }
            }}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <VideoUpload 
            skillId={skillId} 
            onUploadComplete={(s3Key, url) => {
              setVideoS3Key(s3Key);
              setVideoUrl(url);
            }} 
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            {evidence && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteEvidence.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4" />
                {deleteEvidence.isPending ? "Deleting..." : "Delete Evidence"}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/developer/skills"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveEvidence.isPending
                ? "Saving..."
                : evidence
                  ? "Update Evidence"
                  : "Save Evidence"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
