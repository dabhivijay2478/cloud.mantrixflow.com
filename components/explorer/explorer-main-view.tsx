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
      <ResizablePanelGroup direction="vertical" className="h-full">
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="h-full overflow-hidden p-2">
            <QueryEditorPanel />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="h-full overflow-hidden p-2">
            <QueryResultPanel
              renderActions={() => (
                <Button
                  size="xs"
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
