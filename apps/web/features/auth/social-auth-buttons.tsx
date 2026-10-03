"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth";
import { Spinner } from "@/components/ui/custom/spinner";

export function GoogleIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

export function LinkedInIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.86 0 1.56-.7 1.56-1.56s-.7-1.56-1.56-1.56a1.56 1.56 0 0 0 0 3.12m1.37 9.74v-8.37H5.09v8.37h2.74Z" />
    </svg>
  );
}


interface SocialAuthButtonsProps {
  mode?: "signin" | "signup";
}

export function SocialAuthButtons({ mode = "signin" }: SocialAuthButtonsProps) {
  const prefix = mode === "signin" ? "Log in" : "Continue";
  const [loading, setLoading] = useState<"google" | "linkedin" | null>(null);

  // Reset loading state when user navigates back (bfcache restore or tab regains focus)
  useEffect(() => {
    const reset = () => setLoading(null);

    // pageshow fires on bfcache restore (back/forward button)
    window.addEventListener("pageshow", reset);
    // visibilitychange catches cases where the tab regains visibility
    document.addEventListener("visibilitychange", reset);

    return () => {
      window.removeEventListener("pageshow", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, []);

  const handleClick = (provider: "google" | "linkedin") => {
    setLoading(provider);
    window.location.href = authService.getOAuthUrl(provider);
  };

  return (
    <div className="grid gap-3">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => handleClick("linkedin")}
        className="flex h-11 cursor-pointer items-center justify-center gap-3 rounded-full border border-[#D0D5DD] bg-white text-sm font-medium text-[#344054] shadow-xs transition-all hover:border-[#98A2B3] hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading === "linkedin" ? <Spinner /> : <LinkedInIcon className="size-5 shrink-0" />}
        <span>{loading === "linkedin" ? "Redirecting…" : `${prefix} with LinkedIn`}</span>
      </button>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => handleClick("google")}
        className="flex h-11 cursor-pointer items-center justify-center gap-3 rounded-full border border-[#D0D5DD] bg-white text-sm font-medium text-[#344054] shadow-xs transition-all hover:border-[#98A2B3] hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading === "google" ? <Spinner /> : <GoogleIcon className="size-5 shrink-0" />}
        <span>{loading === "google" ? "Redirecting…" : `${prefix} with Google`}</span>
      </button>
    </div>
  );
}
