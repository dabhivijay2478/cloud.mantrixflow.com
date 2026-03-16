"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddConnectorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workspace/connections/new");
  }, [router]);

  return null;
}
