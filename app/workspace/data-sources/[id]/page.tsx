"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DataSourceDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/workspace/connections/${id}`);
    } else {
      router.replace("/workspace/connections");
    }
  }, [router, id]);

  return null;
}
