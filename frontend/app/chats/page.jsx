"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Hash, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! How's it going?",
      sender: "other",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      text: "Pretty good! Just working on some React projects.",
      sender: "user",
      timestamp: new Date(Date.now() - 3500000),
    },
    {
      id: 3,
      text: "That's cool! What are you building?",
      sender: "other",
      timestamp: new Date(Date.now() - 3400000),
    },
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate a reply after a short delay
    setTimeout(() => {
      const reply = {
        id: messages.length + 2,
        text: "Thanks for your message!",
        sender: "other",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Chat Group</h2>
            <p className="text-sm text-gray-500">3 members</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${message.sender === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-white text-gray-800 rounded-bl-none"
                }`}
            >
              <p className="break-words">{message.text}</p>
              <p
                className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {/* <div ref={messagesEndRef} /> */}
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white flex items-end gap-2">
        <Button variant="outline" size="icon" className="shrink-0">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          placeholder="Type a message"
          className="flex-1 resize-none min-h-[40px] max-h-32"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
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