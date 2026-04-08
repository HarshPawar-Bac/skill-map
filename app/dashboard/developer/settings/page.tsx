"use client";

import { useProfile } from "@/hooks/useProfile";
import GitHubConnect from "@/components/settings/GitHubConnect";
import ProfileForm from "@/components/settings/ProfileForm";

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 mt-4">Loading settings...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your profile, GitHub connection, and preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Profile Form */}
        <ProfileForm
          initialData={{
            headline: profile.headline,
            bio: profile.bio,
            location: profile.location,
            website_url: profile.website_url,
          }}
        />

        {/* GitHub Connection */}
        <GitHubConnect
          isConnected={profile.github_connected || false}
          githubUsername={profile.github_username}
        />
      </div>
    </div>
  );
}
