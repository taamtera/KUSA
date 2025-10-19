"use client";

import { useState } from "react";
import { ContextMenu } from "@/components/contextmenu";

const initialContextMenu = {
  visible: false,
  x: 0,
  y: 0,
}

export default function MessageBubble({ message, fromCurrentUser }) {
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
    const menu = document.createElement("div");
    menu.style.position = "absolute";
    menu.style.top = `${pageY}px`;
    menu.style.left = `${pageX}px`;
    menu.style.backgroundColor = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.padding = "8px";
    menu.style.zIndex = 1000;
  };

  const contextMenuClose = () => {
    setContextMenu(initialContextMenu);
  }

  return (
    <div>
      {contextMenu.visible && <ContextMenu x={contextMenu.x} y={contextMenu.y} closeMenu={contextMenuClose} />}
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