"use client";

import { useState } from "react";
import { ContextMenu } from "@/components/contextmenu";

const initialContextMenu = {
  visible: false,
  x: 0,
  y: 0,
}

export default function MessageBubble({ message, fromCurrentUser, onReply }) {
  const isPending = message.pending;
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