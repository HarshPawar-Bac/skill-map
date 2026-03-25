"use client";

import { useAuth } from "@/provider/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { FiUser, FiZap, FiSettings, FiLogOut } from "react-icons/fi";

const NAV_LINKS = [
  {
    label: "My Skills",
    href: "/dashboard/developer/skills",
    icon: FiZap,
  },
  {
    label: "Settings",
    href: "/dashboard/developer/settings",
    icon: FiSettings,
  },
];

export default function DeveloperDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useAuth();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Failed to sign out. Please try again.");
      return;
    }
    window.location.href = "/login";
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <aside className="w-60 flex flex-col border-r border-gray-200 bg-white">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/dashboard/developer/skills">
            <span className="font-semibold text-gray-900 text-lg">
              SkillMap
            </span>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col px-3 py-4 space-y-1">
          {NAV_LINKS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  font-medium transition-colors
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3 px-2">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username ?? "avatar"}
                width={36}
                height={36}
                className="rounded-full shrink-0 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <FiUser size={16} className="text-indigo-600" />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.username ?? "—"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {profile?.headline ?? "Developer"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                Developer
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                       text-sm font-medium text-gray-600 hover:bg-gray-50
                       hover:text-gray-900 transition-colors"
          >
            <FiLogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
