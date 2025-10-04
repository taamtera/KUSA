"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, Paperclip, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarFallback } from "@/components/utils";
import MessageGroup from "./messagegroup";
import { useUser } from "@/context/UserContext";

export default function Chat() {
  const params = useParams();
  const otherUserId = params.id;
  const { user } = useUser();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/v1/chats/${otherUserId}/messages?page=1&limit=50`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (data.status === "success") {
          setMessages(data.messages);

          // Extract other user info from first message
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

    if (otherUserId) {
      fetchMessages();
    }
  }, [otherUserId]);

  // Fetch other user info if missing
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherUser && otherUserId) {
        try {
          const response = await fetch(
            `http://localhost:3001/api/v1/users/${otherUserId}`
          );
          const data = await response.json();
          if (data.status === "success") {
            setOtherUser(data.user);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };
    fetchOtherUser();
  }, [otherUserId, otherUser]);

    // Connect to WebSocket
  useEffect(() => {
    const s = io("http://localhost:3001", { query: { userId } });
    setSocket(s);

    s.on("connect", () => console.log("🟢 Connected to WebSocket"));
    s.on("receive_message", (msg) => {
      console.log("📩 Message received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      s.disconnect();
    };
  }, [user?._id]);

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: newMessage,
      sender: { user: { username: "You" } },
      created_at: new Date(),
      message_type: "text",
      temp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/chats/${otherUserId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage, message_type: "text" }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
        console.error("Failed to send message:", data.message);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const formatDividerTime = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

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
            <AvatarFallback>
              {getAvatarFallback(otherUser?.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-black">
              {otherUser?.display_name || otherUser?.username || "User"}
            </h2>
            <p className="text-sm text-gray-500">Direct message</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
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

              // Insert a divider if hour or date changes
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
                />
              );

              lastTimestamp = group.messages[group.messages.length - 1].created_at;
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
          style={{
            height: "auto",
            overflowY: newMessage.split("\n").length > 4 ? "auto" : "hidden",
          }}
          ref={(textarea) => {
            if (textarea) {
              textarea.style.height = "auto";
              textarea.style.height =
                Math.min(textarea.scrollHeight, 128) + "px";
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
    </div>
  );
}
