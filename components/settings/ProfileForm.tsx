"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useEffect } from "react";

const profileSchema = z.object({
  headline: z.string().max(100, "Headline must be under 100 characters").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be under 500 characters").optional().or(z.literal("")),
  location: z.string().max(100, "Location must be under 100 characters").optional().or(z.literal("")),
  website_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    headline: string | null;
    bio: string | null;
    location: string | null;
    website_url: string | null;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: initialData.headline || "",
      bio: initialData.bio || "",
      location: initialData.location || "",
      website_url: initialData.website_url || "",
    },
  });

  useEffect(() => {
    reset({
      headline: initialData.headline || "",
      bio: initialData.bio || "",
      location: initialData.location || "",
      website_url: initialData.website_url || "",
    });
  }, [initialData, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync(data);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Profile Information
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Headline
          </label>
          <input
            {...register("headline")}
            type="text"
            placeholder="e.g., Full Stack Developer | React & Node.js"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
          />
          {errors.headline && (
            <p className="text-sm text-red-600 mt-1">{errors.headline.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            A brief professional tagline (max 100 characters)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            {...register("bio")}
            rows={4}
            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder:text-gray-400 text-gray-900"
          />
          {errors.bio && (
            <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            A longer description of your background (max 500 characters)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            {...register("location")}
            type="text"
            placeholder="e.g., San Francisco, CA"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
          />
          {errors.location && (
            <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            {...register("website_url")}
            type="url"
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
          />
          {errors.website_url && (
            <p className="text-sm text-red-600 mt-1">{errors.website_url.message}</p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
