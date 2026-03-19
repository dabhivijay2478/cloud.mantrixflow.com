"use client";

import { useEffect, useRef } from "react";
import { X, Sparkles, Send, ArrowRight } from "lucide-react";
import { useAIChatPanel, parseActionFromMessage, stripActionTag } from "./useAIChatPanel";
import { PipelineContextBar } from "./PipelineContextBar";
import { ActionMessage } from "./ActionMessage";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  {
    label: "Select all tables",
    prompt: "Please select all available tables from the source for syncing.",
  },
  {
    label: "Enable incremental sync",
    prompt: "Enable incremental sync for all selected tables using updated_at as the cursor field.",
  },
  {
    label: "Add a destination branch",
    prompt: "Add a new destination branch to this pipeline.",
  },
  {
    label: "Write a rename transform",
    prompt: "Write a Python transform script that renames the user_id field to customer_id for Branch 1.",
  },
];

interface AIChatPanelProps {
  pipelineId: string;
  onClose: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 py-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600/20">
        <Sparkles className="h-3 w-3 text-teal-400" />
      </div>
      <div className="flex items-center gap-1 pt-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function AIChatPanel({ pipelineId, onClose }: AIChatPanelProps) {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    status,
    branches,
    applyAction,
    dismissAction,
    appliedMessageIds,
    dismissedMessageIds,
    append,
  } = useAIChatPanel(pipelineId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendSuggestion = (prompt: string) => {
    append({ role: "user", content: prompt });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input?.trim() && !isStreaming) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-[380px] shrink-0 border-l border-zinc-800 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600/20">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <span className="text-sm font-medium text-zinc-100">AI Assistant</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Pipeline Context Bar */}
      <PipelineContextBar hasMessages={messages.length > 0} />

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center gap-6">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600/15 mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-teal-400" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Ask me anything</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                I can configure tables, set sync modes, add destinations, write transform scripts, and more.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="w-full space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => sendSuggestion(s.prompt)}
                  className="flex items-center justify-between w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left text-xs text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-zinc-100 transition-colors group"
                >
                  {s.label}
                  <ArrowRight className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";
          const textParts = message.parts?.filter(
            (p): p is Extract<typeof p, { type: "text" }> => p.type === "text"
          ) ?? [];
          const fullText = textParts.map((p) => p.text).join("");
          const displayText = stripActionTag(fullText);
          const action = !isUser ? parseActionFromMessage(message) : null;

          return (
            <div
              key={message.id}
              className={cn("flex gap-2.5 py-2", isUser ? "flex-row-reverse" : "flex-row")}
            >
              {!isUser && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600/20 mt-0.5">
                  <Sparkles className="h-3 w-3 text-teal-400" />
                </div>
              )}

              <div className={cn("flex flex-col max-w-[85%]", isUser && "items-end")}>
                <div
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm leading-relaxed",
                    isUser
                      ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
                      : "text-zinc-200 rounded-tl-sm"
                  )}
                >
                  {displayText || (isStreaming && message === messages[messages.length - 1] ? "…" : "")}
                </div>

                {action && (
                  <ActionMessage
                    action={action}
                    branches={branches}
                    messageId={message.id}
                    isApplied={appliedMessageIds.has(message.id)}
                    isDismissed={dismissedMessageIds.has(message.id)}
                    onApply={() => applyAction(action, message.id)}
                    onDismiss={() => dismissAction(message.id)}
                  />
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-800 p-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 focus-within:border-zinc-600 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to configure your pipeline..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none leading-relaxed max-h-28 overflow-y-auto"
              style={{ height: "auto" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 112)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!input?.trim() || isStreaming}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
