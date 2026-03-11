"use client";

import {
  createRoomShellSlice,
  createRoomStore,
  LayoutTypes,
  type RoomShellSliceState,
} from "@sqlrooms/room-shell";
import {
  createSqlEditorSlice,
  type SqlEditorSliceState,
} from "@sqlrooms/sql-editor";
import { DatabaseIcon } from "lucide-react";
import { getExplorerRunInterceptor } from "@/lib/explorer/explorer-run-interceptor";
import { ExplorerDataPanel } from "./explorer-data-panel";
import { ExplorerMainView } from "./explorer-main-view";

const ROOM_PANEL_DATA = "data";
const ROOM_PANEL_MAIN = "main";

export type ExplorerRoomState = RoomShellSliceState & SqlEditorSliceState;

export const { roomStore, useRoomStore } = createRoomStore<ExplorerRoomState>(
  (set, get, store) => {
    const sqlSlice = createSqlEditorSlice({
      queryResultLimit: 10000,
      queryResultLimitOptions: [100, 500, 1000, 5000, 10000, 50000, 100000],
    })(set, get, store);
    const originalParseAndRun = sqlSlice.sqlEditor.parseAndRunCurrentQuery;

    return {
      ...createRoomShellSlice({
      config: {
        title: "Data Explorer",
        dataSources: [],
      },
      layout: {
        config: {
          type: LayoutTypes.enum.mosaic,
          nodes: {
            first: ROOM_PANEL_DATA,
            second: ROOM_PANEL_MAIN,
            direction: "row",
            splitPercentage: 24,
          },
          pinned: [ROOM_PANEL_DATA],
          fixed: [ROOM_PANEL_DATA],
        },
        panels: {
          [ROOM_PANEL_DATA]: {
            title: "Schemas",
            component: ExplorerDataPanel,
            icon: DatabaseIcon,
            placement: "sidebar",
          },
          [ROOM_PANEL_MAIN]: {
            component: ExplorerMainView,
            placement: "main",
          },
        },
      },
    })(set, get, store),
      ...sqlSlice,
      sqlEditor: {
        ...sqlSlice.sqlEditor,
        parseAndRunCurrentQuery: async () => {
          const interceptor = getExplorerRunInterceptor();
          if (interceptor) {
            const handled = await interceptor();
            if (handled) return;
          }
          return originalParseAndRun();
        },
      },
    };
  },
);
