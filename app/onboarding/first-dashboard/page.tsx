"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function FirstDashboardPage() {
  const router = useRouter();
  const { setOnboardingStep } = useWorkspaceStore();

  React.useEffect(() => {
    setOnboardingStep("complete");
    router.push("/onboarding/complete");
  }, [router, setOnboardingStep]);

  return null;
}
