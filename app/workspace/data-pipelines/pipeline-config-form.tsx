"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Info,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useConnections } from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

type PipelineType = "bulk" | "stream" | "emit";

const pipelineSchema = z.object({
  name: z
    .string()
    .min(1, "Pipeline name is required")
    .min(3, "Name must be at least 3 characters"),
  type: z.enum(["bulk", "stream", "emit"]),
  sourceId: z.string().min(1, "Please select a source"),
  destinationIds: z
    .array(z.string())
    .min(1, "Please select at least one destination"),
  description: z.string().optional(),
  // Bulk specific
  autoDetectSchema: z.boolean().optional(),
  // Stream specific
  enableReplay: z.boolean().optional(),
  replayFrom: z.string().optional(),
  transformEnabled: z.boolean().optional(),
  transformQuery: z.string().optional(),
  // Emit specific
  fanOutEnabled: z.boolean().optional(),
});

type PipelineFormValues = z.infer<typeof pipelineSchema>;

interface PipelineConfigurationFormProps {
  onCancel: () => void;
  onSubmit: (data: {
    name: string;
    type: PipelineType;
    sourceId: string;
    destinationIds: string[];
    config: Record<string, unknown>;
  }) => void;
  initialType?: PipelineType;
}

export function PipelineConfigurationForm({
  onCancel,
  onSubmit,
  initialType = "bulk",
}: PipelineConfigurationFormProps) {
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  // Fetch connections from API instead of workspace store
  const { data: connections, isLoading: connectionsLoading } =
    useConnections(orgId);

  // Convert API connections to destination format
  // All connections from the PostgreSQL endpoint are PostgreSQL connections
  const availableDestinations = (connections || []).map((conn) => ({
    id: conn.id,
    name: conn.name,
    type: "database",
  }));
  const [loading, setLoading] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    [],
  );

  const form = useForm<PipelineFormValues>({
    resolver: zodResolver(pipelineSchema),
    defaultValues: {
      name: "",
      type: initialType,
      sourceId: "",
      destinationIds: [],
      description: "",
      autoDetectSchema: true,
      enableReplay: false,
      replayFrom: "",
      transformEnabled: false,
      transformQuery: "",
      fanOutEnabled: true,
    },
  });

  const pipelineType = form.watch("type");
  const selectedSourceId = form.watch("sourceId");

  const handleDestinationToggle = (destinationId: string) => {
    setSelectedDestinations((prev) => {
      const newSelection = prev.includes(destinationId)
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId];
      form.setValue("destinationIds", newSelection);
      return newSelection;
    });
  };

  const onFormSubmit = async (data: PipelineFormValues) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSubmit({
        name: data.name,
        type: data.type as PipelineType,
        sourceId: data.sourceId,
        destinationIds: data.destinationIds,
        config: {
          description: data.description,
          autoDetectSchema: data.autoDetectSchema,
          enableReplay: data.enableReplay,
          replayFrom: data.replayFrom,
          transformEnabled: data.transformEnabled,
          transformQuery: data.transformQuery,
          fanOutEnabled: data.fanOutEnabled,
        },
      });
    } catch (error) {
      console.error("Failed to create pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPipelineTypeInfo = (type: PipelineType) => {
    switch (type) {
      case "bulk":
        return {
          icon: Database,
          title: "Bulk Load Your Data",
          description: "One-time bulk imports from any system",
          features: [
            "Automatic schema detection",
            "No configuration required",
            "Start loading immediately",
            "Free tier available",
          ],
        };
      case "stream":
        return {
          icon: Zap,
          title: "Stream, Replay, Transform",
          description: "Real-time pipelines with rewind capability",
          features: [
            "Stream continuously",
            "Transform on demand",
            "Replay from any point",
            "One collection, infinite uses",
          ],
        };
      case "emit":
        return {
          icon: Sparkles,
          title: "Emit Fearlessly",
          description: "Fan out to any destination",
          features: [
            "No limits on endpoints",
            "No risk to existing pipelines",
            "Just add and go",
            "Free to use",
          ],
        };
    }
  };

  const typeInfo = getPipelineTypeInfo(pipelineType);
  const TypeIcon = typeInfo.icon;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <Tabs
          value={pipelineType}
          onValueChange={(v) => form.setValue("type", v as PipelineType)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Bulk Load
            </TabsTrigger>
            <TabsTrigger value="stream" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Stream
            </TabsTrigger>
            <TabsTrigger value="emit" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Emit
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TypeIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{typeInfo.title}</CardTitle>
                    <CardDescription>{typeInfo.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {typeInfo.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </Tabs>

        <Separator />

        {/* Basic Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Configuration</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pipeline Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sales Data Pipeline" {...field} />
                </FormControl>
                <FormDescription>
                  Choose a descriptive name for your pipeline
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what this pipeline does..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Source</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a data source">
                        {selectedSourceId &&
                          dataSources.find(
                            (ds) => ds.id === selectedSourceId,
                          ) && (
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              <span>
                                {
                                  dataSources.find(
                                    (ds) => ds.id === selectedSourceId,
                                  )?.name
                                }
                              </span>
                            </div>
                          )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dataSources.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No data sources available. Please connect a data source
                        first.
                      </div>
                    ) : (
                      dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <span>{source.name}</span>
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs"
                            >
                              {source.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the source system where your data originates
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Destinations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Destinations</h3>
              <p className="text-sm text-muted-foreground">
                Select one or more destinations for your data
              </p>
            </div>
            <Badge variant="outline">
              {selectedDestinations.length} selected
            </Badge>
          </div>

          <ScrollArea className="h-[300px] rounded-md border p-4">
            {!orgId ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No organization selected. Please select an organization from the
                sidebar.
              </div>
            ) : connectionsLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading data sources...
              </div>
            ) : availableDestinations.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No PostgreSQL data sources available. Please connect a
                PostgreSQL data source first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableDestinations.map((destination) => {
                  const isSelected = selectedDestinations.includes(
                    destination.id,
                  );
                  return (
                    <Card
                      key={destination.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        isSelected && "ring-2 ring-primary border-primary",
                      )}
                      onClick={() => handleDestinationToggle(destination.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                isSelected ? "bg-primary/10" : "bg-muted",
                              )}
                            >
                              <Database
                                className={cn(
                                  "h-5 w-5",
                                  isSelected
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {destination.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {destination.type}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          {form.formState.errors.destinationIds && (
            <p className="text-sm text-destructive">
              {form.formState.errors.destinationIds.message}
            </p>
          )}
        </div>

        <Separator />

        {/* Type-Specific Configuration */}
        {pipelineType === "bulk" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bulk Load Settings</h3>

            <FormField
              control={form.control}
              name="autoDetectSchema"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Auto-detect Schema
                    </FormLabel>
                    <FormDescription>
                      Automatically detect and map your data schema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Free Tier Available
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Bulk load pipelines are free. We automatically detect
                      schemas and start loading your data immediately.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {pipelineType === "stream" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Stream & Transform Settings
            </h3>

            <FormField
              control={form.control}
              name="enableReplay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Replay</FormLabel>
                    <FormDescription>
                      Allow replaying data from any point in time
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("enableReplay") && (
              <FormField
                control={form.control}
                name="replayFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Replay From</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        placeholder="Select date and time"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Start replaying data from this point in time
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="transformEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Transformations
                    </FormLabel>
                    <FormDescription>
                      Transform data on the fly as it streams
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("transformEnabled") && (
              <FormField
                control={form.control}
                name="transformQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transformation Query</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="SELECT * FROM source WHERE ..."
                        className="min-h-[120px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write SQL or transformation logic to modify data in
                      transit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      $25 per GB/month
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Real-time streaming pipelines are charged based on data
                      volume. One collection, infinite uses.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {pipelineType === "emit" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emit Settings</h3>

            <FormField
              control={form.control}
              name="fanOutEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Fan Out</FormLabel>
                    <FormDescription>
                      Send data to multiple destinations simultaneously
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Free to Use
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      No limits on endpoints. No risk to existing pipelines.
                      Just add destinations and go.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Separator />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Pipeline
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
