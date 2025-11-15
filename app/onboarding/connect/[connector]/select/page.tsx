"use client";

import { ArrowLeft, ArrowRight, Loader2, Table } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function SelectTablePage() {
  const router = useRouter();
  const params = useParams();
  const connector = params.connector as string;
  const { currentDataSource, updateDataSource, completeOnboarding } =
    useWorkspaceStore();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSkip = () => {
    completeOnboarding();
    router.push("/workspace");
  };

  useEffect(() => {
    // Simulate fetching tables
    setTimeout(() => {
      const mockTables = [
        "users",
        "orders",
        "products",
        "transactions",
        "analytics",
      ];
      setTables(mockTables);
      setLoading(false);
    }, 1000);
  }, []);

  const handleContinue = () => {
    if (!selectedTable) {
      toast.error("Please select a table");
      return;
    }
    if (currentDataSource) {
      updateDataSource(currentDataSource.id, {
        selectedTable,
        tables,
      });
    }
    router.push("/onboarding/importing");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Table className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Select Table or Sheet</CardTitle>
                <CardDescription>
                  Step 2 of 3 - Choose which data to import
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  {tables.map((table) => {
                    const isSelected = selectedTable === table;
                    return (
                      <button
                        key={table}
                        type="button"
                        onClick={() => setSelectedTable(table)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Table className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{table}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/onboarding/connect/${connector}`)
                    }
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleSkip}>
                      Skip for now
                    </Button>
                    <Button onClick={handleContinue} disabled={!selectedTable}>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
