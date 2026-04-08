import { z } from "zod";

export const skillSchema = z.object({
  name: z
    .string()
    .min(1, "Skill name is required")
    .max(60, "Skill name must be under 60 characters"),
  category: z.enum(["Frontend", "Backend", "DevOps", "Data", "Design", "Other"], {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters (2-3 sentences)")
    .max(500, "Description must be under 500 characters"),
});

export const updateSkillSchema = skillSchema.partial();

export type SkillFormData = z.infer<typeof skillSchema>;
export type UpdateSkillData = z.infer<typeof updateSkillSchema>;
