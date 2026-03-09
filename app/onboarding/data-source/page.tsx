"use client";

import { LoadingState } from "@/components/shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Data source step has been removed from onboarding.
 * This page redirects to workspace when accessed directly.
 */
export default function DataSourcePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workspace");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Redirecting to workspace..." />
    </div>
  );
}
