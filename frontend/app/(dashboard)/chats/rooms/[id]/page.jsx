"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, Paperclip, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarFallback, formatDividerTime } from "@/components/utils";
import MessageGroup from "./messagegroup";
import { useUser } from "@/context/UserContext";
import { io } from "socket.io-client";
import SearchChatDialog from "./searchchatdialog";
import { Search } from "lucide-react"


export default function Chat() {
  const params = useParams();
  const roomId = params.id;
  const { user } = useUser();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

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
      // only update if the message belongs to this chat
      const isRelevant =
        msg.sender?.user?._id === roomId || msg.context === roomId;
      if (isRelevant) {
        messages.find((m) => m._id === msg._id);        console.log("📩 New message received:", msg);
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

  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/v1/chats/rooms/${roomId}/messages?page=1&limit=50`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (data.status === "success") {
          setMessages(data.messages);

          if (data.messages.length > 0) {
            const firstMessage = data.messages[0];
            if (firstMessage.context_type === "User") {
              setOtherUser(firstMessage.context);
            } else if (firstMessage.sender?.user?._id !== roomId) {
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

    if (roomId) fetchMessages();
  }, [roomId]);

  // Fetch other user info if missing
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherUser && roomId) {
        try {
          const response = await fetch(`http://localhost:3001/api/v1/users/${roomId}`);
          const data = await response.json();
          if (data.status === "success") setOtherUser(data.user);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };
    fetchOtherUser();
  }, [roomId, otherUser]);

  // Group messages (no hooks here)
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

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: newMessage,
      sender: { user },
      created_at: new Date(),
      message_type: "text",
      temp: true,
    };

    // setMessages((prev) => [...prev, tempMessage]);
    const messageToSend = {
      fromUserId: user._id,
      toUserId: roomId,
      content: newMessage,
      message_type: "text",
    };

    socketRef.current?.emit("send_message", messageToSend);
    setNewMessage("");
  };

  // Render
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
      <div className="bg-white p-4 border-b flex items-center justify-between shrink-0">
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
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
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

              const fromCurrentUser = group.senderId !== roomId;
              elements.push(
                <MessageGroup
                  key={`group-${gIndex}`}
                  sender={group.sender}
                  messages={group.messages}
                  fromCurrentUser={fromCurrentUser}
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

      {/* Input */}
      <div className="p-4 border-t bg-white flex items-end gap-2 shrink-0">
        <Button variant="outline" size="icon" className="shrink-0">
          <Paperclip className="h-4 w-4 text-gray-600" />
        </Button>
        <Textarea
          placeholder="Type a message"
          className="flex-1 resize-none min-h-5 max-h-32 text-black"
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

      <SearchChatDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        messages={messages}
        user={user}
        otherUser={otherUser}
      />
    </div>
  );
}
