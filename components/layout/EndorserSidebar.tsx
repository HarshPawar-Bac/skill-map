"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiAward, FiSettings, FiLogOut } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  username: string | null;
  headline: string | null;
  avatar_url: string | null;
  role: string;
}

interface EndorserSidebarProps {
  profile: Profile;
}

const navigation = [
  {
    name: "Endorsements",
    href: "/dashboard/endorser/endorsements",
    icon: FiAward,
  },
  {
    name: "Settings",
    href: "/dashboard/endorser/settings",
    icon: FiSettings,
  },
];

export default function EndorserSidebar({ profile }: EndorserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard/endorser/endorsements">
          <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SkillMap
          </h1>
          <p className="text-xs text-gray-500 mt-1">Endorser Dashboard</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {profile.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile.username || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile.headline || "Endorser"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
