"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

type ROLE = "developer" | "endorser" | "employer";
type PROVIDER = "github" | "google";

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<"developer_endorser" | "employer">(
    "developer_endorser",
  );
  const [devRole, setDevRole] = useState<"developer" | "endorser">("developer");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const supabase = createClient();

  const role: ROLE = activeTab === "employer" ? "employer" : devRole;

  async function handleOAuth(provider: PROVIDER) {
    if (!agreed) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        scopes:
          provider === "github" ? "read:user user:email repo" : "profile email",
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Check your email to confirm your account.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Join SkillMap
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab("developer_endorser")}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "developer_endorser"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Developer / Endorser
          </button>
          <button
            onClick={() => setActiveTab("employer")}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "employer"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Employer
          </button>
        </div>

        {activeTab === "developer_endorser" && (
          <div className="space-y-4">
            {/* Sub-role select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                I am a
              </label>
              <select
                value={devRole}
                onChange={(e) =>
                  setDevRole(e.target.value as "developer" | "endorser")
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="developer">
                  Developer — Build a verified portfolio
                </option>
                <option value="endorser">
                  Endorser — Review and vouch for peers
                </option>
              </select>
            </div>

            <div className="space-y-3">
              <button
                disabled={!agreed || loading}
                onClick={() => handleOAuth("github")}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                           rounded-lg bg-gray-900 text-white text-sm font-medium
                           hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
              >
                <FaGithub />
                Continue with GitHub
                {devRole === "developer" && (
                  <span className="text-xs text-gray-400 ml-1">
                    (recommended)
                  </span>
                )}
              </button>
              <button
                disabled={!agreed || loading}
                onClick={() => handleOAuth("google")}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                           rounded-lg border border-gray-200 text-sm font-medium text-gray-700
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
              >
                <FcGoogle />
                Continue with Google
              </button>
            </div>
          </div>
        )}

        {activeTab === "employer" && (
          <div className="space-y-3">
            <button
              disabled={!agreed || loading}
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                         rounded-lg border border-gray-200 text-sm font-medium text-gray-700
                         hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              <FcGoogle />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
                or
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-3">
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           placeholder:text-gray-400 text-gray-900"
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           placeholder:text-gray-400 text-gray-900"
              />
              <button
                type="submit"
                disabled={!agreed || loading}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium
                           rounded-lg hover:bg-indigo-700 disabled:opacity-40
                           disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>
        )}

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-indigo-500"
          />
          <span className="text-sm text-gray-600">
            I agree to the{" "}
            <Link href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </Link>
          </span>
        </label>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
