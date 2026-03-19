"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeletePipeline } from "@/lib/api/hooks/use-data-pipelines";
import { usePipelineBuilderStore } from "../store/pipelineStore";

export function PipelineSettingsDrawer() {
  const router = useRouter();
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const pipelineId = usePipelineBuilderStore((s) => s.pipelineId);
  const updatePipelineMetadata = usePipelineBuilderStore(
    (s) => s.updatePipelineMetadata,
  );
  const updatePipelineForMock = usePipelineBuilderStore(
    (s) => s.updatePipelineForMock,
  );

  const [name, setName] = useState(pipeline?.pipeline.name ?? "");
  const [description, setDescription] = useState(
    pipeline?.pipeline.description ?? "",
  );
  const [saving, setSaving] = useState(false);

  const organizationId = pipeline?.pipeline.organizationId;
  const useMockData = usePipelineBuilderStore((s) => s.useMockData);
  const deletePipeline = useDeletePipeline(organizationId ?? "");

  useEffect(() => {
    if (pipeline?.pipeline) {
      setName(pipeline.pipeline.name ?? "");
      setDescription(pipeline.pipeline.description ?? "");
    }
  }, [pipeline?.pipeline?.name, pipeline?.pipeline?.description]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (useMockData) {
        updatePipelineForMock({ name, description: description || undefined });
      } else {
        await updatePipelineMetadata({ name, description });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pipelineId) return;
    if (useMockData) {
      router.push("/workspace/data-pipelines");
      return;
    }
    if (!organizationId) return;
    await deletePipeline.mutateAsync(pipelineId);
    router.push("/workspace/data-pipelines");
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>Pipeline Settings</SheetTitle>
        <SheetDescription>
          Name, description, and danger zone
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="pipeline-name">Name</Label>
          <Input
            id="pipeline-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Pipeline"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pipeline-desc">Description</Label>
          <Textarea
            id="pipeline-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Deleting this pipeline cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-2">
                Delete Pipeline
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete pipeline?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the pipeline and all its run
                  history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deletePipeline.isPending}
                >
                  {deletePipeline.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <SheetFooter>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </SheetFooter>
    </>
  );
}
