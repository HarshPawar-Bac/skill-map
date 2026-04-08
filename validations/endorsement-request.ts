import { z } from "zod";

export const endorsementRequestSchema = z.object({
  skill_id: z.string().uuid("Invalid skill ID"),
  endorser_email: z
    .string()
    .min(1, "Endorser username or email is required"),
});

export type EndorsementRequestFormData = z.infer<typeof endorsementRequestSchema>;
