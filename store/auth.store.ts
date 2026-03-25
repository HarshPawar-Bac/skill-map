import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  role: string;
  username: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website_url: string | null;
  github_connected: boolean;
  github_username: string | null;
  availability: string;
  open_to_remote: boolean;
  onboarding_complete: boolean;
  status: string;
}

interface AuthStoreState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      fetchProfile: async (userId: string) => {
        const supabase = createClient();
        const { data } = await supabase
          .from("users")
          .select(
            `id, role, username, headline, bio, avatar_url, location, website_url,
             github_connected, github_username, availability, open_to_remote,
             onboarding_complete, status`,
          )
          .eq("id", userId)
          .single();
        set({ profile: (data as Profile) ?? null });
      },

      refreshProfile: async () => {
        const { user } = get();
        if (user) {
          await get().fetchProfile(user.id);
        }
      },

      reset: () => set({ user: null, profile: null, loading: false }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
