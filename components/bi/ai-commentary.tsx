"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * AICommentary
 * @description Full paragraph AI-generated insight and analysis.
 * Detailed explanation component for complex insights and recommendations.
 * @param {AICommentaryProps} props - Component properties
 * @param {string} props.content - Commentary text content
 * @param {string} [props.title] - Commentary title
 * @param {string} [props.summary] - Brief summary or key takeaway
 * @param {string[]} [props.highlights] - Key points or bullet highlights
 * @param {string} [props.confidence] - AI confidence level (e.g., "High", "95%")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} AICommentary component
 * @example
 * <AICommentary
 *   title="Performance Analysis"
 *   content="Based on the data trends, there is a strong positive correlation between marketing spend and revenue growth. The ROI has improved by 18% quarter-over-quarter."
 *   summary="Marketing investments are yielding significant returns"
 *   highlights={[
 *     "18% ROI improvement",
 *     "Strong correlation identified",
 *     "Recommend increasing budget"
 *   ]}
 *   confidence="High"
 * />
 */

export interface AICommentaryProps {
  content: string;
  title?: string;
  summary?: string;
  highlights?: string[];
  confidence?: string;
  className?: string;
}

export function AICommentary({
  content,
  title,
  summary,
  highlights,
  confidence,
  className,
}: AICommentaryProps) {
  return (
    <Card className={cn("border-l-4 border-l-blue-500", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            {title && <CardTitle className="text-lg">{title}</CardTitle>}
            {!title && <CardTitle className="text-lg">AI Insight</CardTitle>}
          </div>
          {confidence && (
            <span className="text-xs text-muted-foreground">
              Confidence: {confidence}
            </span>
          )}
        </div>
        {summary && (
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mt-2">
            {summary}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content}
        </p>

        {highlights && highlights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Key Points:</h4>
            <ul className="space-y-1.5">
              {highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
