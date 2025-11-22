/**
 * Schema-Based Properties Panel
 * Dynamically renders component properties based on schemas
 */

"use client";

import { Database, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    getComponentProperties,
    validateComponentProps,
    type ValidationError,
} from "@/components/bi/component-schemas";
import type {
    DashboardComponent,
    Dataset,
} from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { PropertyControl } from "./property-control";
import { DataDialog } from "./data-dialog";

interface SchemaPropertiesPanelProps {
    component: DashboardComponent | null;
    dataset: Dataset | null;
    onUpdate: (updates: Partial<DashboardComponent>) => void;
}

export function SchemaPropertiesPanel({
    component,
    onUpdate,
}: SchemaPropertiesPanelProps) {
    const {
        propertiesPanelOpen,
        setPropertiesPanelOpen,
        currentDashboard,
        dataSources,
    } = useWorkspaceStore();

    const [dataDialogOpen, setDataDialogOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Map<string, string>
    >(new Map());

    // Get the connected data source
    const connectedDataSource = currentDashboard?.dataSourceId
        ? dataSources.find((ds) => ds.id === currentDashboard.dataSourceId)
        : null;

    // Get schema properties for the selected component
    const properties = component
        ? getComponentProperties(component.type)
        : [];

    // Current property values
    const [propertyValues, setPropertyValues] = useState<
        Record<string, unknown>
    >({});

    // Initialize property values from component config
    useEffect(() => {
        if (component?.config) {
            setPropertyValues(component.config as Record<string, unknown>);
        }
    }, [component]);

    // Handle property change
    const handlePropertyChange = (key: string, value: unknown) => {
        const newValues = { ...propertyValues, [key]: value };
        setPropertyValues(newValues);

        // Validate in real-time
        if (component) {
            const validation = validateComponentProps(component.type, newValues);
            if (validation.errors) {
                const errorMap = new Map<string, string>();
                validation.errors.forEach((error: ValidationError) => {
                    errorMap.set(error.property, error.message);
                });
                setValidationErrors(errorMap);
            } else {
                setValidationErrors(new Map());
            }
        }

        // Update component immediately for live preview
        onUpdate({
            config: newValues,
        });
    };

    if (!component) {
        return (
            <div className="h-full w-full border-l bg-muted/30 flex flex-col items-center justify-center">
                <div className="text-center p-6">
                    <span
                        className="text-xs text-muted-foreground select-none"
                        style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            textOrientation: "mixed",
                        }}
                    >
                        Properties
                    </span>
                </div>
            </div>
        );
    }

    if (!propertiesPanelOpen) {
        return (
            <button
                type="button"
                className="h-full w-full border-l bg-muted/30 flex flex-col items-center relative cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setPropertiesPanelOpen(true)}
            >
                <div className="absolute right-0 top-0 bottom-0 w-px bg-border" />
                <div className="flex flex-col items-center justify-center flex-1 w-full py-4">
                    <span
                        className="text-xs text-muted-foreground select-none"
                        style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            textOrientation: "mixed",
                        }}
                    >
                        Properties
                    </span>
                </div>
            </button>
        );
    }

    return (
        <div className="h-full w-full border-l bg-muted/30 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
                <div>
                    <h2 className="font-semibold text-sm">Properties</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {component.type}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setPropertiesPanelOpen(false)}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-6">
                    {!connectedDataSource && (
                        <Card className="border-yellow-500/50 bg-yellow-500/10">
                            <CardContent className="p-4">
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                    No data source connected. Please connect a data source first.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {connectedDataSource && (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        Data Source
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => setDataDialogOpen(true)}
                                    >
                                        <Database className="h-3 w-3 mr-1" />
                                        Change
                                    </Button>
                                </div>
                                <p className="text-sm font-medium">
                                    {connectedDataSource.name}
                                </p>
                            </div>

                            <Separator />
                        </>
                    )}

                    {/* Dynamic property controls based on schema */}
                    {properties.length > 0 ? (
                        <div className="space-y-4">
                            {properties.map((property) => (
                                <PropertyControl
                                    key={property.key}
                                    property={property}
                                    value={propertyValues[property.key]}
                                    onChange={(value) =>
                                        handlePropertyChange(property.key, value)
                                    }
                                    error={validationErrors.get(property.key)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                No properties available for this component
                            </p>
                        </div>
                    )}

                    {/* Validation summary */}
                    {validationErrors.size > 0 && (
                        <Card className="border-destructive/50 bg-destructive/10">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-destructive mb-2">
                                    Validation Errors ({validationErrors.size})
                                </p>
                                <ul className="text-xs text-destructive/90 space-y-1">
                                    {Array.from(validationErrors.values()).map((error, idx) => (
                                        <li key={idx}>• {error}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>

            <DataDialog open={dataDialogOpen} onOpenChange={setDataDialogOpen} />
        </div>
    );
}
