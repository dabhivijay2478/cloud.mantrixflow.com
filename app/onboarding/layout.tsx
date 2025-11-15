import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding - MantrixFlow",
  description: "Get started with MantrixFlow",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
