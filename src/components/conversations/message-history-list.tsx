import { ChatMessage } from "@/services/repositories/objects/conversations";
import { useChatStore } from "@/store/use-chat-store";
import React, { useCallback, useEffect, useRef } from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowRenderer,
} from "react-virtualized";
import MessageItem from "./message-item";

// Tạo cache với fixedWidth vì chiều rộng ổn định trong List
let cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 60,
});

export default function MessageHistoryList() {
  const { messages } = useChatStore();
  console.log("rendering message history list", messages);
  const listRef = useRef<List>(null);

  // Khi cửa sổ thay đổi kích thước, xóa cache và tính lại chiều cao các dòng
  const handleResize = useCallback(() => {
    cache.clearAll();
    listRef.current?.recomputeRowHeights();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const rowRenderer: ListRowRenderer = ({
    index,
    key,
    parent,
    style,
  }: {
    index: number;
    key: string;
    parent: any;
    style: React.CSSProperties;
  }) => {
    // Otherwise render normal message
    const message: ChatMessage = messages[index];
    return (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        {({ registerChild }) => (
          <div ref={registerChild} style={style}>
            <MessageItem message={message} />
          </div>
        )}
      </CellMeasurer>
    );
  };

  return (
    <div style={{ width: "100%", height: "700px" }}>
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) => (
          <List
            ref={listRef}
            width={width}
            height={height}
            rowCount={messages.length}
            rowHeight={cache.rowHeight}
            deferredMeasurementCache={cache}
            rowRenderer={rowRenderer}
            overscanRowCount={5}
          />
        )}
      </AutoSizer>
    </div>
  );
}
