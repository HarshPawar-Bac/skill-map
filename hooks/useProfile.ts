import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  username: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  github_connected: boolean | null;
  github_username: string | null;
  avatar_url: string | null;
}

interface ProfileUpdateData {
  headline?: string;
  bio?: string;
  location?: string;
  website_url?: string;
}

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw new Error("Failed to fetch profile");
      }

      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ProfileUpdateData) => {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useConnectGithub() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/github-connect");
      if (!response.ok) {
        throw new Error("Failed to initiate GitHub connection");
      }
      const data = await response.json();
      return data.url;
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDisconnectGithub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/users/me/github-disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to disconnect GitHub");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("GitHub disconnected successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
