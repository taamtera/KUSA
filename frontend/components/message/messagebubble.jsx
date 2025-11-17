"use client"

import React, { useState, useRef, useEffect } from "react"
import { ContextMenu } from "@/components/contextmenu"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useUser } from "@/context/UserContext";

const initialContextMenu = {
    visible: false,
    x: 0,
    y: 0,
}

export default function MessageBubble({ message, fromCurrentUser, onReply, onOpenThread, onEdit, editingTo }) {
    const isPending = message.temp || message.pending
    const [error, setError] = useState(null)
    const isEditing = editingTo?._id === message._id
    const [contextMenu, setContextMenu] = useState(initialContextMenu)
    const [editedContent, setEditedContent] = useState(message?.content)
    const [textareaHeight, setTextareaHeight] = useState("auto")
    const textareaRef = useRef(null)
    const { user } = useUser();
    const currentUsername = user?.username || "";

    const isUnsent = message.active === false;

    const handleContextMenu = (e) => {
        if (isUnsent) return;
        e.preventDefault()

        const { pageX, pageY } = e
        setContextMenu({
            visible: true,
            x: pageX,
            y: pageY,
        })
    }

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/v1/messages/${message._id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editedContent }),
            })
            // console.log(body)
        } catch (error) {
            setError("Fail to edited message")
        } finally {
            message.content = editedContent
            onEdit(null)
        }
    }

    const resizeTextarea = (el) => {
        el.style.height = "auto"
        el.style.height = `${el.scrollHeight}px`
        setTextareaHeight(`${el.scrollHeight}px`)
    }

    const contextMenuClose = () => {
        setContextMenu(initialContextMenu)
    }
    // console.log("MessageBubble props:", { onReply, message });
    const handleReplyClick = () => {
        // console.log("Reply clicked, onReply function:", onReply);
        if (isUnsent) return;
        if (onReply) {
            onReply(message)
        }
        contextMenuClose()
    }

    const handleEditClick = () => {
        if (isUnsent) return;
        if (onEdit) {
            onEdit(message)
        }
        contextMenuClose()
    }

    const handleOpenThread = () => {
        if (onOpenThread && message.reply_to?._id) onOpenThread(message.reply_to)
    }

    const handleCancel = () => {
        onEdit(null)
    }

    const handleTextareaChange = (e) => {
        setEditedContent(e.target.value)

        // dynamically grow height
        const target = e.target
        target.style.height = "auto"
        target.style.height = target.scrollHeight + "px"
        setTextareaHeight(target.scrollHeight + "px")
    }

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            resizeTextarea(textareaRef.current)

            // Optional: focus & move cursor to end
            const el = textareaRef.current
            el.focus()
            el.selectionStart = el.selectionEnd = el.value.length
        }
    }, [isEditing, message.content])

    const handleUnsend = async () => {
        // setMessages(prev => prev.map(m => m._id === message._id ? { ...m, active: false} : m));

        try {
            const res = await fetch(`http://localhost:3001/api/v1/messages/dms/${message._id}/unsend`, {
                method: "PATCH",
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to unsend");
            }

        } catch (err) {
            console.error(err);
            setError("Failed to unsend message");
        }
    };

    function highlightMentions(text, currentUsername) {
        const mentionRegex = /@([\w]+)/g
        const parts = text.split(mentionRegex)

        return parts.map((part, i) => {
            if (i % 2 === 1) {
                const isMe = part.toLowerCase() === currentUsername.toLowerCase()
                if (isMe) {
                    // rainbow gradient mention for current user
                    return (
                        <span className="font-semibold bg-gradient-to-r from-red-400 via-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            @{part}
                        </span>
                    )
                } else {
                    // normal mention style for others
                    return (
                        <span key={i} className="text-cyan-600 font-medium">
                            @{part}
                        </span>
                    )
                }
            }
            return <span key={i}>{part}</span>
        })
    }

    return (
        <div className="">
            {contextMenu.visible && <ContextMenu x={contextMenu.x} y={contextMenu.y} closeMenu={contextMenuClose} onReplyClick={handleReplyClick} onEditClick={handleEditClick} onUnsendClick={handleUnsend} currentUser={fromCurrentUser} content={editedContent || message.content} />}

            <div className={`flex flex-col ${fromCurrentUser ? "justify-end" : "justify-start"} items-start`}>
                {/* Reply preview (quoted parent) */}
                {message.reply_to && !isUnsent && (
                    <button
                        onClick={handleOpenThread}
                        className={`inline-block w-fit text-right -mb-2 max-w-[min(80vw,28rem)]
                        ${fromCurrentUser ? "self-end" : ""}`}
                        title="View thread"
                    >
                        <div className="rounded-xl border border-gray-300 bg-white px-3 py-2">
                            <div className="text-xm font-medium text-gray-700 text-left">{message.reply_to?.sender?.user?.display_name || message.reply_to?.sender?.user?.username || "Unknown"}</div>
                            <div className="text-xs text-gray-600 truncate">{message.reply_to?.content || "—"}</div>
                        </div>
                    </button>
                )}

                {/* Message */}
                <div
                    onContextMenu={handleContextMenu}
                    className={`inline-block w-fit px-4 py-2 rounded-2xl break-words
                      ${isUnsent ? "bg-transparent border-1 border-gray-300 italic text-gray-500" : "bg-gray-300 text-gray-900"}
                      ${isPending ? "opacity-60 animate-pulse" : ""}
                      ${fromCurrentUser ? "self-end" : ""}`}
                    style={{
                        maxWidth: "min(80vw, 28rem)",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {editingTo?._id === message._id ? (
                        <div>
                            <textarea ref={textareaRef} value={editedContent} className="w-[416px] overflow-hidden rounded-md border border-gray-300 p-2 text-black" onChange={handleTextareaChange} style={{ height: textareaHeight }}></textarea>
                            <div className="flex justify-end content-end gap-2 pt-4">
                                <Button type="button" variant="outline" className="cursor-pointer bg-transparent" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="cursor-pointer" onClick={handleSave}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : isUnsent ? (
                        <p className="">
                            This message was unsent.
                        </p>
                    ) : (
                        <p>{highlightMentions(message.content, currentUsername)}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
