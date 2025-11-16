/**
 * Theme Preview Component
 * Live preview of theme customization
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ThemePreview() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Theme Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Colors */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Colors</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="default">
              Primary
            </Button>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
            <Button size="sm" variant="ghost">
              Ghost
            </Button>
            <Button size="sm" variant="destructive">
              Destructive
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Badges</h4>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Input</h4>
          <Input placeholder="Enter text..." />
        </div>

        {/* Typography */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Typography</h4>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Heading 1</h1>
            <h2 className="text-xl font-semibold">Heading 2</h2>
            <h3 className="text-lg font-medium">Heading 3</h3>
            <p className="text-sm">Body text with regular weight</p>
            <p className="text-xs text-muted-foreground">
              Muted text for secondary information
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Card</h4>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a preview card showing how your theme will look.
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

