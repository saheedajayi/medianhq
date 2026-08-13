"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { getAuthDestination } from "@/lib/auth-routing";

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    authService
      .me()
      .then((response) => {
        if (isCancelled) return;
        const destination = getAuthDestination(response.data);
        router.replace(destination);
      })
      .catch(() => {
        if (isCancelled) return;
        router.replace("/signin");
      })
      .finally(() => {
        if (!isCancelled) setIsChecking(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FFFAF5]">
      <p className="text-sm text-[#667085]">
        {isChecking ? "Checking session..." : ""}
      </p>
    </div>
  );
}

