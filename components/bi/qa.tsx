"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * QA
 * @description Q&A component for natural language queries and AI-powered insights.
 * @param {QAProps} props - Component properties
 * @param {string} [props.title] - Component title
 * @param {string} [props.description] - Component description
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {Function} [props.onQuery] - Callback when query is submitted
 * @param {boolean} [props.loading] - Loading state
 * @param {QAAnswer[]} [props.history] - Query history
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} QA component
 * @example
 * <QA
 *   title="Ask Questions"
 *   placeholder="What was the revenue last month?"
 *   onQuery={(query) => handleQuery(query)}
 *   loading={isLoading}
 * />
 */

export interface QAAnswer {
  question: string;
  answer: string;
  timestamp: Date;
}

export interface QAProps {
  title?: string;
  description?: string;
  placeholder?: string;
  onQuery?: (query: string) => void;
  loading?: boolean;
  history?: QAAnswer[];
  className?: string;
}

export function QA({
  title = "Ask Questions",
  description = "Get instant answers about your data",
  placeholder = "Ask a question about your data...",
  onQuery,
  loading = false,
  history = [],
  className,
}: QAProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onQuery?.(query);
      setQuery("");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="min-h-[100px] resize-none"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Ask
              </>
            )}
          </Button>
        </form>

        {history.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Recent Questions</h4>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Q: {item.question}
                  </p>
                  <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border">
                    {item.answer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

