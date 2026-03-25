import { z } from "zod";

export const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be under 30 characters"),
  headline: z
    .string()
    .min(1, "Headline is required")
    .max(80, "Headline must be under 80 characters"),
  bio: z.string().max(300, "Bio must be under 300 characters").optional(),
  location: z
    .string()
    .max(100, "Location must be under 100 characters")
    .optional(),
  availability: z.enum(["open", "employed", "not_looking"]),
});


export type OnboardingFormData = z.infer<typeof onboardingSchema>;
