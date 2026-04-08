import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EvidenceFormData } from "@/validations/evidence";
import toast from "react-hot-toast";

interface Evidence {
  id: string;
  skill_id: string;
  user_id: string;
  live_url: string;
  live_url_valid: boolean | null;
  github_repo_url: string;
  github_summary: any | null;
  video_s3_key: string;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UrlValidationResult {
  valid: boolean;
  status: number;
  statusText: string;
}

interface GithubRepoSummary {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  last_commit: string;
  commit_count: number;
}

interface VideoUploadResult {
  upload_url: string;
  s3_key: string;
}

export function useEvidence(skillId: string) {
  return useQuery<Evidence | null>({
    queryKey: ["evidence", skillId],
    queryFn: async () => {
      const response = await fetch(`/api/skills/${skillId}/evidence`);
      if (!response.ok) {
        throw new Error("Failed to fetch evidence");
      }
      const result = await response.json();
      return result.data;
    },
  });
}

export function useVerifyUrl(skillId: string) {
  return useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch(`/api/skills/${skillId}/evidence/verify-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify URL");
      }

      const result = await response.json();
      return result.data as UrlValidationResult;
    },
  });
}

export function useVerifyGithub(skillId: string) {
  return useMutation({
    mutationFn: async (repo_url: string) => {
      const response = await fetch(`/api/skills/${skillId}/evidence/verify-github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify GitHub repository");
      }

      const result = await response.json();
      return result.data as GithubRepoSummary;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useGetVideoUploadUrl(skillId: string) {
  return useMutation({
    mutationFn: async ({
      content_type,
      file_size,
    }: {
      content_type: string;
      file_size: number;
    }) => {
      const response = await fetch(`/api/skills/${skillId}/evidence/video-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type, file_size }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const result = await response.json();
      return result.data as VideoUploadResult;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSaveEvidence(skillId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evidenceData: EvidenceFormData) => {
      const response = await fetch(`/api/skills/${skillId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evidenceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save evidence");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence", skillId] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Evidence saved successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteEvidence(skillId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/skills/${skillId}/evidence`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete evidence");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence", skillId] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Evidence deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
