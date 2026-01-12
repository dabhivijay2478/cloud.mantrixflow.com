"use client";

import { CreditCard, Settings } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function OrganizationDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const organizationId = params.id as string;

  // Determine active tab based on current path
  const isBillingPage = pathname?.includes("/billing");
  const isSettingsPage = pathname?.includes("/edit");
  const activeTab = isBillingPage ? "billing" : isSettingsPage ? "settings" : "billing";

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <div className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="billing" asChild>
                  <Link href={`/organizations/${organizationId}/billing`}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="settings" asChild>
                  <Link href={`/organizations/${organizationId}/edit`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
        {children}
      </div>
    </div>
  );
}
