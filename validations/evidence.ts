import { z } from "zod";

export const evidenceSchema = z.object({
  live_url: z
    .string()
    .url("Please enter a valid URL")
    .min(1, "Live URL is required"),
  live_url_valid: z.boolean().default(false),
  github_repo_url: z
    .string()
    .url("Please enter a valid GitHub repository URL")
    .regex(
      /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,
      "Must be a valid GitHub repository URL (e.g., https://github.com/username/repo)"
    ),
  github_summary: z.any().nullable().optional(),
  video_s3_key: z.string().min(1, "Video upload is required"),
  video_url: z.string().url().nullable().optional(),
});

export type EvidenceFormData = z.infer<typeof evidenceSchema>;
