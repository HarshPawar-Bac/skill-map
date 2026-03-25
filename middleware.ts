import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = new Set(["/", "/login", "/register", "/terms", "/403"]);
const PUBLIC_PREFIXES = ["/u/", "/auth/"];

const ROLE_HOME: Record<string, string> = {
  developer: "/dashboard/developer/skills",
  endorser: "/dashboard/endorser/endorsements",
  employer: "/dashboard/employer/shortlists",
  admin: "/admin",
};

function isPublicPath(pathname: string) {
  return (
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { response, user, supabase } = await updateSession(request);

  if (isPublicPath(pathname)) return response;

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return pathname.startsWith("/onboarding")
      ? response
      : NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const { role, onboarding_complete } = profile;
  const roleHome = ROLE_HOME[role] ?? "/dashboard/developer/skills";

  if (!onboarding_complete)
    return pathname.startsWith("/onboarding")
      ? response
      : NextResponse.redirect(new URL("/onboarding", request.url));

  if (pathname.startsWith("/onboarding"))
    return NextResponse.redirect(new URL(roleHome, request.url));

  if (pathname.startsWith("/admin") && role !== "admin")
    return NextResponse.redirect(new URL("/403", request.url));

  if (pathname.startsWith("/dashboard") && !pathname.startsWith(roleHome))
    return NextResponse.redirect(new URL("/403", request.url));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
