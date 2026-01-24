"use client";

import { Editor } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useMemo } from "react";

interface PythonScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  sampleRecord?: Record<string, any>;
  className?: string;
  height?: string;
}

export function PythonScriptEditor({
  value,
  onChange,
  sampleRecord,
  className,
  height = "400px",
}: PythonScriptEditorProps) {
  const defaultScript = useMemo(() => {
    // Generate default script based on sample record if available
    if (sampleRecord && Object.keys(sampleRecord).length > 0) {
      const fields = Object.keys(sampleRecord);
      const mappings = fields.map(field => {
        // Handle nested fields
        if (field.includes(".")) {
          const parts = field.split(".");
          return `        "${parts[parts.length - 1]}": record.get("${field}")`;
        }
        return `        "${field}": record.get("${field}")`;
      }).join(",\n");
      
      return `import json

def transform(record):
    """
    Transform source record to destination format.
    Use record.get("source_field") to read from source.
    Return dict with destination keys.
    
    Sample record structure:
${JSON.stringify(sampleRecord, null, 4).split('\n').map(line => '    ' + line).join('\n')}
    """
    return {
${mappings}
    }`;
    }
    
    return `import json

def transform(record):
    """
    Transform source record to destination format.
    Use record.get("source_field") to read from source.
    Return dict with destination keys.
    
    Example:
    - record.get("id") reads from source "id" field
    - Return dict keys are destination column names
    """
    return {
        "id": record.get("id"),
        "name": record.get("name"),
        # Add more mappings...
    }`;
  }, [sampleRecord]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: "on",
      wordWrap: "on",
      automaticLayout: true,
    });
  };

  return (
    <div className={className}>
      <div className="border rounded-lg overflow-hidden">
        <Editor
          height={height}
          defaultLanguage="python"
          value={value || defaultScript}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
          }}
        />
      </div>
      
      {sampleRecord && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="text-sm font-semibold mb-2">Sample Record Preview:</div>
          <pre className="text-xs overflow-auto max-h-32 font-mono bg-background p-2 rounded border">
            {JSON.stringify(sampleRecord, null, 2)}
          </pre>
          <div className="text-xs text-muted-foreground mt-2">
            Use <code className="px-1 py-0.5 bg-background rounded">record.get("field_name")</code> to access fields from this record.
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-muted-foreground">
        <strong>Note:</strong> The function must be named <code className="px-1 py-0.5 bg-muted rounded">transform</code> and accept a <code className="px-1 py-0.5 bg-muted rounded">record</code> parameter (dict). Return a dict with destination field names as keys.
      </div>
    </div>
  );
}
