"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, Paperclip, Users, X, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarFallback, formatDividerTime } from "@/components/utils";
import MessageGroup from "@/components/message/messagegroup";
import { useUser } from "@/context/UserContext";
import { io } from "socket.io-client";
import SearchChatDialog from "@/components/message/searchchatdialog";
import DMsOptions from "@/components/options/dms_options";
import { Search } from "lucide-react"

export default function Chat() {
  const params = useParams();
  const otherUserId = params.id;
  const { user } = useUser();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Thread state
  const [threadOpen, setThreadOpen] = useState(false);
  const [threadParent, setThreadParent] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);

  // OPEN THREAD (reply list)
  const openThread = async (parentMsg) => {
    if (!parentMsg?._id) {
      console.warn('OpenThread called without a valid _id', parentMsg);
      return;
    }
    try {
      setThreadLoading(true);
      setThreadOpen(true);
      setThreadParent(parentMsg);

      const res = await fetch(
        `http://localhost:3001/api/v1/messages/${parentMsg._id}/replies?page=1&limit=50&sort=asc`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.status === "success") {
        setThreadReplies(data.replies || []);
      } else {
        setThreadReplies([]);
      }
    } catch (e) {
      console.error("Thread fetch failed:", e);
      setThreadReplies([]);
    } finally {
      setThreadLoading(false);
    }
  };

  const closeThread = () => {
    setThreadOpen(false);
    setThreadReplies([]);
    setThreadParent(null);
  };

  // WebSocket setup
  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = io("http://localhost:3001", {
      query: { userId: user._id },
      withCredentials: true,
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🟢 Connected as:", user.username);
    });

    socket.on("receive_message", (msg) => {
      const isRelevant =
        msg.sender?.user?._id === otherUserId || msg.context === otherUserId;
      if (isRelevant) {
        console.log("📩 New message received:", msg);
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/v1/chats/dms/${otherUserId}/messages?page=1&limit=50`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (data.status === "success") {
          setMessages(data.messages);

          if (data.messages.length > 0) {
            const firstMessage = data.messages[0];
            if (firstMessage.context_type === "User") {
              setOtherUser(firstMessage.context);
            } else if (firstMessage.sender?.user?._id !== otherUserId) {
              setOtherUser(firstMessage.sender?.user);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (otherUserId) fetchMessages();
  }, [otherUserId]);

  // Fetch other user info if missing
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherUser && otherUserId) {
        try {
          const response = await fetch(`http://localhost:3001/api/v1/users/${otherUserId}`);
          const data = await response.json();
          if (data.status === "success") setOtherUser(data.user);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };
    fetchOtherUser();
  }, [otherUserId, otherUser]);

  // Group messages by sender
  const groupMessages = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((msg) => {
      const senderId = msg.sender?.user?._id || "unknown";
      if (!currentGroup || currentGroup.senderId !== senderId) {
        currentGroup = { senderId, sender: msg.sender?.user, messages: [msg] };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(msg);
      }
    });

    return groups;
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Reply Handlers ---
  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // --- Send Message ---
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // const tempMessage = {
    //   _id: `temp-${Date.now()}`,
    //   content: newMessage,
    //   sender: { user },
    //   created_at: new Date(),
    //   message_type: "text",
    //   temp: true,
    // };

    // Send message via socket
    const messageToSend = {
      from_id: user._id,
      to_id: otherUserId,
      context_type: "User",
      content: newMessage,
      message_type: "text",
      reply_to: replyingTo?._id || null, // 👈 include reply reference if replying
    };

    socketRef.current?.emit("send_message", messageToSend);
    setNewMessage("");
    setReplyingTo(null); // 👈 clear reply after sending
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white p-2 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={getAvatarUrl(otherUser?.icon_file)} />
            <AvatarFallback>{getAvatarFallback(otherUser?.username)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-black">
              {otherUser?.display_name || otherUser?.username || "User"}
            </h2>
            <p className="text-sm text-gray-500">Direct message</p>
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
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          (() => {
            const messageGroups = groupMessages(messages);
            const elements = [];
            let lastTimestamp = null;

            messageGroups.forEach((group, gIndex) => {
              const firstMsgTime = new Date(group.messages[0].created_at);
              const lastTime = lastTimestamp ? new Date(lastTimestamp) : null;
              const needsDivider =
                !lastTime ||
                firstMsgTime.getHours() !== lastTime.getHours() ||
                firstMsgTime.getDate() !== lastTime.getDate();

              if (needsDivider) {
                elements.push(
                  <div
                    key={`divider-${gIndex}`}
                    className="flex items-center justify-center my-6"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-px w-[calc(40vw-200px)] bg-gray-300" />
                      <span className="text-xs opacity-75">
                        {formatDividerTime(firstMsgTime)}
                      </span>
                      <div className="h-px w-[calc(40vw-200px)] bg-gray-300" />
                    </div>
                  </div>
                );
              }

              const fromCurrentUser = group.senderId !== otherUserId;
              elements.push(
                <MessageGroup
                  key={`group-${gIndex}`}
                  sender={group.sender}
                  messages={group.messages}
                  fromCurrentUser={fromCurrentUser}
                  onReply={handleReply} // ✅ pass reply handler
                  onOpenThread={openThread}
                />
              );

              lastTimestamp =
                group.messages[group.messages.length - 1].created_at;
            });

            return elements;
          })()
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="p-4 border-t bg-white flex items-end gap-2 shrink-0">
          <div className="text-3xl px-3">↰</div>
          <div className="flex-1 w-4">
            <div className="text-sm text-gray-500 font-medium">
              Replying to {replyingTo.sender?.user?.username || "user"}
            </div>
            <div className="text-sm text-gray-600 truncate w-auto">
              {replyingTo.content}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

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
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          size="icon"
          className="shrink-0"
          onClick={handleSendMessage}
          disabled={newMessage.trim() === ""}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Thread Modal */}
      {threadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[min(92vw,520px)] max-h-[70vh] bg-white rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-sm font-semibold">
                Thread • Reply to {threadParent?.sender?.nickname || threadParent?.sender?.user?.display_name || threadParent?.sender?.user?.username || "user"}
              </div>
              <button onClick={closeThread} className="p-1 rounded hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* parent message */}
            {threadParent && (
              <div className="px-4 pt-3 pb-2 bg-gray-50">
                <div className="text-xs text-gray-600 mb-1">
                  {threadParent?.sender?.user?.display_name || threadParent?.sender?.user?.username || "user"}
                </div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {threadParent.content}
                </div>
              </div>
            )}

            <div className="px-4 py-3 border-t overflow-y-auto space-y-2">
              {threadLoading ? (
                <div className="text-sm text-gray-500">Loading replies…</div>
              ) : threadReplies.length === 0 ? (
                <div className="text-sm text-gray-500">No replies yet.</div>
              ) : (
                threadReplies.map((msg) => (
                  <div key={msg._id}>
                    <div className="text-xs text-gray-600">
                      {msg.sender?.user?.display_name || msg.sender?.user?.username || "user"}
                    </div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <SearchChatDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        messages={messages}
        user={user}
        otherUser={otherUser}
      />

      <DMsOptions
        open={isOptionsOpen}
        onOpenChange={setIsOptionsOpen}
        otherUserId={otherUserId}
      />

    </div>
  );
}
