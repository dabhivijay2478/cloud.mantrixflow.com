"use client";

import { Textarea } from "@/components/ui/textarea";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  onMount?: (editor: unknown) => void;
  className?: string;
}

export function SQLEditor({
  value,
  onChange,
  onMount,
  className,
}: SQLEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      placeholder="Enter your SQL query here..."
      style={{ fontFamily: "monospace", minHeight: "400px" }}
      ref={(el) => {
        if (el && onMount) {
          onMount(el);
        }
      }}
    />
  );
}

