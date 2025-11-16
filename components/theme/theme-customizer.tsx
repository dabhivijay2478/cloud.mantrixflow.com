/**
 * Theme Customizer Component
 * Main component for theme customization in settings
 */

"use client";

import { useState } from "react";
import { useThemeCustomization } from "@/hooks/use-theme-customization";
import { ColorPicker } from "./color-picker";
import { FontSelector } from "./font-selector";
import { ThemePreview } from "./theme-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "@/lib/utils/toast";

export function ThemeCustomizer() {
  const themeStore = useThemeCustomization();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(
        "Theme saved successfully",
        "Your theme customization has been applied.",
      );
    } catch {
      toast.error(
        "Failed to save theme",
        "Unable to save theme settings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    themeStore.resetTheme();
    toast.success(
      "Theme reset",
      "Theme has been reset to default values.",
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Primitive Colors</CardTitle>
              <CardDescription>
                Customize the base color palette for your theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Primary"
                  value={themeStore.theme.colors.primary}
                  onChange={(color) => themeStore.setColor("primary", color)}
                  description="Main brand color"
                />
                <ColorPicker
                  label="Secondary"
                  value={themeStore.theme.colors.secondary}
                  onChange={(color) => themeStore.setColor("secondary", color)}
                  description="Secondary brand color"
                />
                <ColorPicker
                  label="Accent"
                  value={themeStore.theme.colors.accent}
                  onChange={(color) => themeStore.setColor("accent", color)}
                  description="Accent color for highlights"
                />
                <ColorPicker
                  label="Neutral"
                  value={themeStore.theme.colors.neutral}
                  onChange={(color) => themeStore.setColor("neutral", color)}
                  description="Base neutral color"
                />
                <ColorPicker
                  label="Success"
                  value={themeStore.theme.colors.success}
                  onChange={(color) => themeStore.setColor("success", color)}
                  description="Success state color"
                />
                <ColorPicker
                  label="Warning"
                  value={themeStore.theme.colors.warning}
                  onChange={(color) => themeStore.setColor("warning", color)}
                  description="Warning state color"
                />
                <ColorPicker
                  label="Error"
                  value={themeStore.theme.colors.error}
                  onChange={(color) => themeStore.setColor("error", color)}
                  description="Error state color"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Font Settings</CardTitle>
              <CardDescription>
                Customize typography and font families
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FontSelector
                label="Sans Serif (Body)"
                value={themeStore.theme.fonts.sans}
                onChange={(font) => themeStore.setFont("sans", font)}
                description="Primary font for body text"
                category="sans-serif"
              />
              <FontSelector
                label="Serif"
                value={themeStore.theme.fonts.serif}
                onChange={(font) => themeStore.setFont("serif", font)}
                description="Font for serif text"
                category="serif"
              />
              <FontSelector
                label="Monospace"
                value={themeStore.theme.fonts.mono}
                onChange={(font) => themeStore.setFont("mono", font)}
                description="Font for code and monospace text"
                category="monospace"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Border Radius</CardTitle>
              <CardDescription>
                Adjust the border radius for rounded corners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Border Radius</Label>
                  </div>
                  
                  {/* Slider and Input */}
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[themeStore.theme.radius]}
                      onValueChange={([value]) => themeStore.setRadius(value)}
                      min={0}
                      max={2}
                      step={0.1}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2 w-32">
                      <Input
                        type="number"
                        value={themeStore.theme.radius}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0 && val <= 2) {
                            themeStore.setRadius(val);
                          }
                        }}
                        min={0}
                        max={2}
                        step={0.1}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">rem</span>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="flex items-center gap-4 pt-4">
                    <div
                      className="w-16 h-16 bg-primary rounded"
                      style={{
                        borderRadius: `${themeStore.theme.radius}rem`,
                      }}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Preview</p>
                      <p className="text-xs text-muted-foreground">
                        This shows how the border radius will look
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <ThemePreview />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Theme
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

