import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeveloperSidebar from "@/components/layout/DeveloperSidebar";

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, username, headline, avatar_url, role, github_connected")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "developer") {
    redirect("/403");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DeveloperSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
