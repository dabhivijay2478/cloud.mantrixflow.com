"use client";

import {
  CreateTableModal,
  QueryEditorPanel,
  QueryResultPanel,
} from "@sqlrooms/sql-editor";
import {
  Button,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDisclosure,
} from "@sqlrooms/ui";
import { PlusIcon } from "lucide-react";
import { useRoomStore } from "./explorer-store";

export function ExplorerMainView() {
  const createTableModal = useDisclosure();
  const lastQuery = useRoomStore((s) => {
    const selectedId = s.sqlEditor.config.selectedQueryId;
    const qr = s.sqlEditor.queryResultsById[selectedId];
    if (qr?.status === "success" && qr?.type === "select") return qr.query;
    return s.sqlEditor.getCurrentQuery();
  });

  return (
    <>
      <ResizablePanelGroup
        direction="vertical"
        className="h-full border-l border-border/50"
      >
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-background/50">
            <QueryEditorPanel />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border/30" />
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-background/50">
            <QueryResultPanel
              renderActions={() => (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={createTableModal.onOpen}
                  className="gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  New table
                </Button>
              )}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <CreateTableModal
        query={lastQuery}
        isOpen={createTableModal.isOpen}
        onClose={createTableModal.onClose}
        allowMultipleStatements={true}
        showSchemaSelection={true}
      />
    </>
  );
}
