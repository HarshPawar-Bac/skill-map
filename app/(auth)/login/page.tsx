  "use client";

  import { useState } from "react";
  import { createClient } from "@/lib/supabase/client";
  import Link from "next/link";
  import { FaGithub } from "react-icons/fa";
  import { FcGoogle } from "react-icons/fc";
  import toast from "react-hot-toast";

  type PROVIDER = "github" | "google";

  export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const supabase = createClient();

    async function handleOAuth(provider: PROVIDER) {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes:
            provider === "github" ? "read:user user:email repo" : "profile email",
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
      }
    }

    async function handleEmailLogin(e: React.FormEvent) {
      e.preventDefault();
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Invalid email or password");
        setLoading(false);
        return;
      }
      window.location.href = "/auth/callback";
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your SkillMap account
            </p>
          </div>

          {/* OAuth */}
          <div className="space-y-3">
            <button
              disabled={loading}
              onClick={() => handleOAuth("github")}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                        rounded-lg bg-gray-900 text-white text-sm font-medium
                        hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              <FaGithub />
              Continue with GitHub
            </button>
            <button
              disabled={loading}
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                        rounded-lg border border-gray-200 text-sm font-medium text-gray-700
                        hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <FcGoogle />
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
              or sign in with email
            </div>
          </div>

          {/* Email/password */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-400 placeholder:text-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-400 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium
                        rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    );
  }
