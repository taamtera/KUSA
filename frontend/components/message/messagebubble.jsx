"use client";

import React, { useState } from "react";
import { ContextMenu } from "@/components/contextmenu";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const initialContextMenu = {
  visible: false,
  x: 0,
  y: 0,
}

export default function MessageBubble({ message, fromCurrentUser, onReply, onOpenThread, onEdit, editingTo }) {
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

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(message);
    }
    contextMenuClose();
  }

  const handleOpenThread = () => {
    if (onOpenThread && message.reply_to?._id) onOpenThread(message.reply_to);
  };

  const handleCancel = () => {
    onEdit(null);
  };

  return (
    <div className="">
      {contextMenu.visible && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          closeMenu={contextMenuClose}
          onReplyClick={handleReplyClick}
          onEditClick={handleEditClick}
        />
      )}
      
      <div 
        className={`flex flex-col ${
        fromCurrentUser ? "justify-end" : "justify-start"
        } items-start`}
      >

        {/* Reply preview (quoted parent) */}
        {message.reply_to && (
          <button
            onClick={handleOpenThread}
            className={`inline-block w-fit text-right mb-1 max-w-[min(80vw,28rem)]
                        ${fromCurrentUser ? "self-end" : ""}`}
            title="View thread"
          >
            <div className="rounded-xl border border-gray-300/70 bg-white/60 px-3 py-2">
              <div className="text-xm font-medium text-gray-700 text-left">
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

        {/* Message */}
        <div
          onContextMenu={handleContextMenu}
          className={`inline-block w-fit px-4 py-2 rounded-2xl break-words bg-gray-300 text-gray-900 
                      ${isPending ? "opacity-60 animate-pulse" : ""}
                      ${fromCurrentUser ? "self-end" : ""}`}
          style={{
            maxWidth: "min(80vw, 28rem)",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {
            editingTo?._id === message._id ? 
            <div>
              <textarea
                value={message.content}
                className="w-[416px]"
                
              >
              </textarea>
              <div className="flex justify-end content-end gap-2 pt-4">
                <Button type="button" variant="outline" className="cursor-pointer bg-transparent" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                    Save
                </Button>
              </div>
            </div>
            : 
            <p>{message.content}</p>
          }
        </div>
      </div>
      
    </div>
  );
}