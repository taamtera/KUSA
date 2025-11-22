"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { Send, Paperclip, Users, Ellipsis } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl, getAvatarFallback, formatDividerTime } from "@/components/utils"
import MessageGroup from "@/components/message/messagegroup"
import { useUser } from "@/context/UserContext"
import { io } from "socket.io-client"
import SearchChatDialog from "@/components/message/searchchatdialog"
import ServerOptions from "@/components/options/server_options"
import { Search } from "lucide-react"
import MessageReply from "@/components/message/messagereply";
import MessageThread from "@/components/message/messagethread";
import { useMessageThread } from "@/lib/use-message-thread";


export default function Chat() {
    const params = useParams()
    const roomId = params.id
    const { user } = useUser()

    const [server, setServer] = useState(null)
    const [roomName, setRoomName] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isOptionsOpen, setIsOptionsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [otherUser, setOtherUser] = useState(null)
    const [newMessage, setNewMessage] = useState("")
    const [editingTo, setEditingTo] = useState(null)
    const messagesEndRef = useRef(null)
    const socketRef = useRef(null)
    const [replyingTo, setReplyingTo] = useState(null)

    // Message Thread State and Handlers
    const { threadOpen, threadParent, threadReplies, threadLoading, setThreadReplies, setThreadParent, setThreadOpen, openThread, closeThread } = useMessageThread()

    // WebSocket setup
    useEffect(() => {
        if (!user?._id) return

        socketRef.current = io("http://localhost:3001", {
            query: { userId: user._id },
            withCredentials: true,
            transports: ["websocket"],
        })

        const socket = socketRef.current

        socket.on("connect", () => {
            console.log("🟢 Connected as:", user.username)
        })

        socket.on("receive_message", (msg) => {
            // only update if the message belongs to this chat
            const isRelevant = msg.sender?._id === roomId || msg.context === roomId
            if (isRelevant) {
                messages.find((m) => m._id === msg._id)
                console.log("📩 New message received:", msg)
                setMessages((prev) => [...prev, msg])
            }
        })

        // === unsend message handler === //
        socket.on("message_unsent", (payload) => {
            // 1) update main message list + any embedded reply_to that points to this message
            setMessages((prev) =>
                prev.map((m) => {
                    let updated = m

                    // If this *is* the message being unsent
                    if (m._id === payload._id) {
                        updated = { ...updated, active: false, content: payload.content }
                    }

                    // If this message is a reply and its parent (reply_to) was unsent
                    if (m.reply_to && m.reply_to._id === payload._id) {
                        updated = {
                            ...updated,
                            reply_to: {
                                ...m.reply_to,
                                active: false,
                                content: payload.content,
                            },
                        }
                    }

                    return updated
                })
            )

            // 2) update open thread replies
            setThreadReplies((prev) => prev.map((r) => (r._id === payload._id ? { ...r, active: false, content: payload.content } : r)))

            // 3) update thread parent if the parent got unsent
            setThreadParent((prev) => (prev && prev._id === payload._id ? { ...prev, active: false, content: payload.content } : prev))
        })

        // === edit message handler === //
        socket.on("message_edited", (payload) => {
            // 1) update main message list + embedded reply_to references
            setMessages((prev) =>
                prev.map((m) => {
                    let updated = m

                    // If this is the edited message itself
                    if (m._id === payload._id) {
                        updated = {
                            ...updated,
                            content: payload.content,
                            edited_count: payload.edited_count,
                            edited_at: payload.edited_at,
                        }
                    }

                    // If this message is a reply and its parent was edited
                    if (m.reply_to && m.reply_to._id === payload._id) {
                        updated = {
                            ...updated,
                            reply_to: {
                                ...m.reply_to,
                                content: payload.content,
                                edited_count: payload.edited_count,
                                edited_at: payload.edited_at,
                            },
                        }
                    }

                    return updated
                })
            )

            // 2) update open thread replies (if thread open)
            setThreadReplies((prev) =>
                prev.map((r) =>
                    r._id === payload._id
                        ? {
                              ...r,
                              content: payload.content,
                              edited_count: payload.edited_count,
                              edited_at: payload.edited_at,
                          }
                        : r
                )
            )

            // 3) update thread parent if it's the edited message
            setThreadParent((prev) =>
                prev && prev._id === payload._id
                    ? {
                          ...prev,
                          content: payload.content,
                          edited_count: payload.edited_count,
                          edited_at: payload.edited_at,
                      }
                    : prev
            )
        })

        socket.on("disconnect", () => {
            console.log("🔴 Disconnected")
        })

        return () => {
            socket.disconnect()
        }
    }, [user?._id])

    // Fetch messages from API
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true)
                const response = await fetch(`http://localhost:3001/api/v1/chats/rooms/${roomId}/messages?page=1&limit=50`, { credentials: "include" })
                const data = await response.json()

                if (data.status === "success") {
                    setMessages(data.messages)

                    if (data.server) {
                        setServer(data.server)
                    }

                    if (data.roomName) {
                        setRoomName(data.roomName)
                    }

                    if (data.members) {
                        setOtherUser(data.members)
                    }

                    // if (data.messages.length > 0) {
                    //   const firstMessage = data.messages[0];
                    //   if (firstMessage.context_type === "User") {
                    //     setOtherUser(firstMessage.context);
                    //   } else if (firstMessage.sender?.user?._id !== roomId) {
                    //     setOtherUser(firstMessage.sender?.user);
                    //   }
                    // }
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error)
            } finally {
                setLoading(false)
            }
        }

        if (roomId) fetchMessages()
    }, [roomId])

    const handleEdit = (message) => {
        setEditingTo(message) //
    }

    // // Fetch other user info if missing
    // useEffect(() => {
    //   const fetchOtherUser = async () => {
    //     if (!otherUser && roomId) {
    //       try {
    //         const response = await fetch(`/api/v1/servers/${server._id}/members`);
    //         const data = await response.json();
    //         if (data.status === "success") setOtherUser(data.user);
    //       } catch (error) {
    //         console.error("Failed to fetch user:", error);
    //       }
    //     }
    //   };
    //   fetchOtherUser();
    // }, [roomId, otherUser]);

    // Group messages (no hooks here)
    const groupMessages = (messages) => {
        const groups = []
        let currentGroup = null

        messages.forEach((msg) => {
            const senderId = msg.sender?._id || "unknown"
            if (!currentGroup || currentGroup.senderId !== senderId) {
                currentGroup = { senderId, sender: msg.sender, messages: [msg] }
                groups.push(currentGroup)
            } else {
                currentGroup.messages.push(msg)
            }
        })

        return groups
    }

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return

        // setMessages((prev) => [...prev, tempMessage]);
        const messageToSend = {
            from_id: user._id,
            to_id: roomId,
            context_type: "Room",
            content: newMessage,
            message_type: "text",
            reply_to: replyingTo?._id || null,
        }

        socketRef.current?.emit("send_message", messageToSend)
        setNewMessage("")
        setReplyingTo(null)
        setEditingTo(null)
    }

    const handleReply = (message) => {
        setReplyingTo(message)
    }

    const handleCancelReply = () => {
        setReplyingTo(null)
    }

    // console.log("📤 Sending message:", messageToSend);

    // Render
    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-gray-100 items-center justify-center">
                <div className="text-gray-500">Loading messages...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white p-2 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`data:${server.icon_file?.mime_type};base64,${server.icon_file?.base64}`} />
                        <AvatarFallback>{getAvatarFallback(server?.server_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold text-black">{server?.server_name || "Server"}</h2>
                        <p className="text-sm text-gray-500"> {roomName} </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOptionsOpen(true)}>
                        <Ellipsis className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No messages yet. Start a conversation!</div>
                ) : (
                    (() => {
                        const messageGroups = groupMessages(messages)
                        const elements = []
                        let lastTimestamp = null

                        messageGroups.forEach((group, gIndex) => {
                            const firstMsgTime = new Date(group.messages[0].created_at)
                            const lastTime = lastTimestamp ? new Date(lastTimestamp) : null
                            const needsDivider = !lastTime || firstMsgTime.getHours() !== lastTime.getHours() || firstMsgTime.getDate() !== lastTime.getDate()

                            if (needsDivider) {
                                elements.push(
                                    <div key={`divider-${gIndex}`} className="flex items-center justify-center my-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="h-px w-[calc(40vw-200px)] bg-gray-300" />
                                            <span className="text-xs opacity-75">{formatDividerTime(firstMsgTime)}</span>
                                            <div className="h-px w-[calc(40vw-200px)] bg-gray-300" />
                                        </div>
                                    </div>
                                )
                            }

                            const fromCurrentUser = group.senderId == user._id
                            elements.push(<MessageGroup key={`group-${gIndex}`} sender={group.sender} messages={group.messages} fromCurrentUser={fromCurrentUser} onReply={handleReply} onOpenThread={openThread} onEdit={handleEdit} editingTo={editingTo} isRooms={true} />)

                            lastTimestamp = group.messages[group.messages.length - 1].created_at
                        })

                        return elements
                    })()
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && <MessageReply replyingTo={replyingTo} onCancel={handleCancelReply}></MessageReply>}

            {/* Thread Modal */}
            {threadOpen && <MessageThread threadOpen={threadOpen} onthreadOpen={setThreadOpen} threadParent={threadParent} threadLoading={threadLoading} threadReplies={threadReplies} closeThread={closeThread}></MessageThread>}

            {/* Input */}
            <div className="py-3 px-2 border-t bg-white flex items-end gap-2 shrink-0">
                <Button variant="outline" size="icon" className="shrink-0">
                    <Paperclip className="h-4 w-4 text-gray-600" />
                </Button>
                <Textarea
                    placeholder="Type a message"
                    className="flex-1 resize-none min-h-5 max-h-10 text-black"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                        }
                    }}
                />
                <Button size="icon" className="shrink-0" onClick={handleSendMessage} disabled={newMessage.trim() === ""}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>

            <SearchChatDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} messages={messages} user={user} otherUser={otherUser} />

            <ServerOptions open={isOptionsOpen} onOpenChange={setIsOptionsOpen} otherUser={otherUser} server={server} user={user} />
        </div>
    )
}
