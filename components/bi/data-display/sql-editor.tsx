"use client";

import Editor from "@monaco-editor/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: "vs-dark" | "light";
  height?: string;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  onMount?: (editor: unknown) => void;
}

/**
 * SQL Editor Component
 * @description A reusable Monaco-based SQL editor component
 */
export function SQLEditor({
  value,
  onChange,
  language = "sql",
  theme = "vs-dark",
  height = "100%",
  className,
  placeholder,
  readOnly = false,
  onMount,
}: SQLEditorProps) {
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
    if (onMount) {
      onMount(editor);
    }
  };

  return (
    <div className={cn("w-full h-full", className)}>
      <Editor
        height={height}
        language={language}
        value={value || ""}
        onChange={(val) => onChange(val || "")}
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          readOnly,
          placeholder: placeholder,
          lineNumbers: "on",
          renderLineHighlight: "all",
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: "line",
          fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
}
