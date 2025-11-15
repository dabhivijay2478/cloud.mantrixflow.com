"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "@/lib/utils/toast";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      toast.error(
        "Sign out failed",
        error.message || "Failed to sign out. Please try again.",
      );
      return;
    }

    toast.success(
      "Signed out successfully",
      "You have been successfully logged out.",
    );
    router.push("/auth/login");
  };

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

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.user_metadata?.first_name || user.email}!
          </p>
        </div>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Name:</strong>{" "}
                {user.user_metadata?.full_name || "Not provided"}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p>
                <strong>Last Sign In:</strong>{" "}
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Your BI dashboard overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Analytics features coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate and view reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Report generation features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
