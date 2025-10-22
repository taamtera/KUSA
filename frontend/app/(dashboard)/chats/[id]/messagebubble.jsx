"use client";

import { useState } from "react";
import { ContextMenu } from "@/components/contextmenu";

const initialContextMenu = {
  visible: false,
  x: 0,
  y: 0,
}

export default function MessageBubble({ message, fromCurrentUser, onReply, onOpenThread }) {
  const isPending = message.temp || message.pending;
  const [contextMenu, setContextMenu] = useState(initialContextMenu);
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    
    const {pageX, pageY} = e;
    setContextMenu({
      visible: true,
      x: pageX,
      y: pageY,
    });
  };

  const contextMenuClose = () => {
    setContextMenu(initialContextMenu);
  }
  // console.log("MessageBubble props:", { onReply, message });
  const handleReplyClick = () => {
    // console.log("Reply clicked, onReply function:", onReply);
    if (onReply) {
      onReply(message);
    }
    contextMenuClose();
  }

  const handleOpenThread = () => {
    if (onOpenThread && message.reply_to?._id) onOpenThread(message.reply_to);
  };

  return (
    <div>
      {contextMenu.visible && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          closeMenu={contextMenuClose}
          onReplyClick={handleReplyClick}
        />
      )}

      {/* Reply preview (quoted parent) */}
      {message.reply_to && (
        <button
          onClick={handleOpenThread}
          className="block w-full text-right mb-1 max-w-[min(80vw,28rem)]"
          title="View thread"
        >
          <div className="rounded-xl border border-gray-300/70 bg-white/60 px-3 py-2">
            <div className="text-xs font-medium text-gray-700">
              {message.reply_to?.sender?.user?.display_name
                || message.reply_to?.sender?.user?.username
                || "Unknown"}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {message.reply_to?.content || "—"}
            </div>
          </div>
        </button>
      )}

      <div
        onContextMenu={handleContextMenu}
        className={`relative inline-block px-4 py-2 rounded-2xl break-words bg-gray-300 text-gray-900 ${isPending ? "opacity-60 animate-pulse" : ""}`}
        style={{
          maxWidth: "min(80vw, 28rem)",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        <p>{message.content}</p>
      </div>
    </div>
    
  );
}