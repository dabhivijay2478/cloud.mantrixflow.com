"use client";

import type { ToolUIPart } from "ai";
import { GlobeIcon, MicIcon, Sparkles, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  ModelSelectorLogo,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

type MessageType = {
  key: string;
  from: "user" | "assistant";
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  tools?: {
    name: string;
    description: string;
    status: ToolUIPart["state"];
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
};

const models = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    chef: "OpenAI",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    chef: "OpenAI",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    id: "claude-opus-4-20250514",
    name: "Claude 4 Opus",
    chef: "Anthropic",
    chefSlug: "anthropic",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    chef: "Anthropic",
    chefSlug: "anthropic",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    chef: "Google",
    chefSlug: "google",
    providers: ["google"],
  },
];

const suggestions = [
  "Help me understand my data sources",
  "How do I create a data pipeline?",
  "What data sources are supported?",
  "Explain data transformation",
  "Show me pipeline examples",
  "How do I connect to a database?",
  "What is streaming data?",
  "How do I export my data?",
];

const mockResponses = [
  "I can help you understand your data sources. You can connect various databases, APIs, and file systems to start building your data pipelines.",
  "To create a data pipeline, first connect a data source, then configure the transformation rules, and finally set up the destination where you want the data to flow.",
  "We support many data sources including PostgreSQL, MySQL, MongoDB, BigQuery, Snowflake, S3, APIs, and more. Check the data sources page for the full list.",
  "Data transformation allows you to modify, filter, and enrich your data as it flows through the pipeline. You can use SQL queries or visual transformations.",
];

export function AgentPanel() {
  const { agentPanelOpen, setAgentPanelOpen } = useWorkspaceStore();
  const [model, setModel] = useState<string>(models[0].id);
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [_streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );

  const selectedModelData = models.find((m) => m.id === model);

  const streamResponse = useCallback(
    async (messageId: string, content: string) => {
      setStatus("streaming");
      setStreamingMessageId(messageId);

      const words = content.split(" ");
      let currentContent = "";

      for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? " " : "") + words[i];

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.versions.some((v) => v.id === messageId)) {
              return {
                ...msg,
                versions: msg.versions.map((v) =>
                  v.id === messageId ? { ...v, content: currentContent } : v,
                ),
              };
            }
            return msg;
          }),
        );

        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 100 + 50),
        );
      }

      setStatus("ready");
      setStreamingMessageId(null);
    },
    [],
  );

  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: MessageType = {
        key: `user-${Date.now()}`,
        from: "user",
        versions: [
          {
            id: `user-${Date.now()}`,
            content,
          },
        ],
      };

      setMessages((prev) => [...prev, userMessage]);

      // Generate assistant response
      setTimeout(async () => {
        const assistantMessageId = `assistant-${Date.now()}`;
        const randomResponse =
          mockResponses[Math.floor(Math.random() * mockResponses.length)];

        const assistantMessage: MessageType = {
          key: `assistant-${Date.now()}`,
          from: "assistant",
          sources: [
            {
              href: "#",
              title: "AI Response Generated",
            },
          ],
          reasoning: {
            content: `Analyzing the request: "${content}". I'll provide assistance based on your requirements.`,
            duration: 5,
          },
          versions: [
            {
              id: assistantMessageId,
              content: "",
            },
          ],
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Simulate AI response
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Stream the response
          await streamResponse(assistantMessageId, randomResponse);
        } catch (error) {
          toast.error("Failed to generate response");
          console.error(error);
          setStatus("error");
        }
      }, 500);
    },
    [streamResponse],
  );

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    setStatus("submitted");

    if (message.files?.length) {
      toast.success("Files attached", {
        description: `${message.files.length} file(s) attached to message`,
      });
    }

    addUserMessage(message.text || "Sent with attachments");
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setStatus("submitted");
    addUserMessage(suggestion);
  };

  if (!agentPanelOpen) {
    return (
      <button
        type="button"
        className="h-full w-full border-l bg-muted/30 flex flex-col items-center relative cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setAgentPanelOpen(true)}
      >
        <div className="absolute right-0 top-0 bottom-0 w-px bg-border" />
        <div className="flex flex-col items-center justify-center flex-1 w-full py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 mb-4 rounded-md flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Click to expand AI Agent</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-xs text-muted-foreground select-none"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                textOrientation: "mixed",
              }}
            >
              Agent
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden border-l bg-muted/30">
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <h2 className="font-semibold text-sm">AI Agent</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setAgentPanelOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center space-y-2">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Start a conversation to get help with data pipelines and
                  sources
                </p>
              </div>
            </div>
          )}
          {messages.map(({ versions, ...message }) => (
            <MessageBranch defaultBranch={0} key={message.key}>
              <MessageBranchContent>
                {versions.map((version) => (
                  <Message
                    from={message.from}
                    key={`${message.key}-${version.id}`}
                  >
                    <div>
                      {message.sources?.length && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source) => (
                              <Source
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                      {message.reasoning && (
                        <Reasoning duration={message.reasoning.duration}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning.content}
                          </ReasoningContent>
                        </Reasoning>
                      )}
                      <MessageContent>
                        <MessageResponse>{version.content}</MessageResponse>
                      </MessageContent>
                    </div>
                  </Message>
                ))}
              </MessageBranchContent>
              {versions.length > 1 && (
                <MessageBranchSelector from={message.from}>
                  <MessageBranchPrevious />
                  <MessageBranchPage />
                  <MessageBranchNext />
                </MessageBranchSelector>
              )}
            </MessageBranch>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="grid shrink-0 gap-4 pt-4">
        <Suggestions className="px-4">
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>
        <div className="w-full px-4 pb-4">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(event) => setText(event.target.value)}
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton
                  onClick={() => setUseMicrophone(!useMicrophone)}
                  variant={useMicrophone ? "default" : "ghost"}
                >
                  <MicIcon size={16} />
                  <span className="sr-only">Microphone</span>
                </PromptInputButton>
                <PromptInputButton
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  variant={useWebSearch ? "default" : "ghost"}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-auto border-none bg-transparent shadow-none hover:bg-accent data-[size=default]:h-auto data-[size=sm]:h-auto px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      {selectedModelData?.chefSlug && (
                        <ModelSelectorLogo
                          provider={selectedModelData.chefSlug}
                        />
                      )}
                      <SelectValue>
                        {selectedModelData?.name || "Select model"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {["OpenAI", "Anthropic", "Google"].map((chef) => (
                      <SelectGroup key={chef}>
                        <SelectLabel>{chef}</SelectLabel>
                        {models
                          .filter((m) => m.chef === chef)
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className="flex items-center gap-2">
                                <ModelSelectorLogo provider={m.chefSlug} />
                                <ModelSelectorName>{m.name}</ModelSelectorName>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!(text.trim() || status) || status === "streaming"}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
