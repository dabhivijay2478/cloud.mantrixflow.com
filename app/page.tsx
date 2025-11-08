"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      <main className="flex flex-col items-center justify-center text-center space-y-8 p-8">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-4xl font-bold">MantrixFlow</h1>
        </div>
        
        <div className="max-w-2xl space-y-4">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            AI-Powered Business Intelligence Platform
          </h2>
          <p className="text-lg text-muted-foreground">
            Transform your data into actionable insights with our advanced AI-driven analytics platform.
            Get started by creating an account or signing in to your existing one.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={() => router.push("/auth/signup")}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/auth/login")}>
            Sign In
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            New to MantrixFlow?{" "}
            <a href="/auth/signup" className="underline underline-offset-4 hover:text-foreground">
              Create your free account
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
