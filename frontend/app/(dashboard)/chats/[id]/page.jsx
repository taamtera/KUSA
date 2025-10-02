"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, Paperclip, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarFallback } from "@/components/utils";

export default function Chat() {
  const params = useParams();
  const otherUserId = params.id;
  
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
        const response = await fetch(`http://localhost:3001/api/v1/chats/${otherUserId}/messages?page=1&limit=50`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status === 'success') {
          setMessages(data.messages);
          
          // Extract other user info from first message
          if (data.messages.length > 0) {
            const firstMessage = data.messages[0];
            if (firstMessage.context_type === 'User') {
              setOtherUser(firstMessage.context);
            } else if (firstMessage.sender?.user?._id !== otherUserId) {
              setOtherUser(firstMessage.sender?.user);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (otherUserId) {
      fetchMessages();
    }
  }, [otherUserId]);

  // Fetch other user info if not available from messages
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherUser && otherUserId) {
        try {
          const response = await fetch(`http://localhost:3001/api/v1/users/${otherUserId}`);
          const data = await response.json();
          if (data.status === 'success') {
            setOtherUser(data.user);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
    };

    fetchOtherUser();
  }, [otherUserId, otherUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    // Optimistically add message to UI
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: newMessage,
      sender: { user: { username: "You" } }, // Temporary sender info
      created_at: new Date(),
      message_type: 'text'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      // Send message to API
      const response = await fetch(`http://localhost:3001/api/v1/chats/${otherUserId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          message_type: 'text'
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Replace temp message with real one from server
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        setMessages(prev => [...prev, data.message]);
      } else {
        // Handle error - remove temp message
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        console.error('Failed to send message:', data.message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine if message is from current user
  const isCurrentUser = (message) => {
    // This would need to compare with actual current user ID from your auth context
    // For now, we'll assume you have a way to get current user ID
    return message.sender?.user?._id !== otherUserId;
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
            <AvatarFallback>{getAvatarFallback(otherUser?.username)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-black">
              {otherUser?.display_name || otherUser?.username || 'User'}
            </h2>
            <p className="text-sm text-gray-500">Direct message</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages - the only scrollable part */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${isCurrentUser(message) ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                  isCurrentUser(message)
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isCurrentUser(message) ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white flex items-end gap-2 shrink-0">
        <Button variant="outline" size="icon" className="shrink-0">
          <Paperclip className="h-4 w-4 text-gray-600" />
        </Button>
        <Textarea
          placeholder="Type a message"
          className="flex-1 resize-none min-h-5 max-h-32 text-black"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{
            height: 'auto',
            overflowY: newMessage.split('\n').length > 4 ? 'auto' : 'hidden'
          }}
          ref={(textarea) => {
            if (textarea) {
              textarea.style.height = 'auto';
              textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
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