"use client";

import MessageBubble from "./messagebubble";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarFallback, formatTime } from "@/components/utils";

export default function MessageGroup({ sender, messages, fromCurrentUser, onReply, onOpenThread, onEdit, editingTo, isRooms }) {
  const senderName = fromCurrentUser
    ? "You"
    : sender?.display_name || sender?.username || "User";
  const senderAvatar = fromCurrentUser ? null : getAvatarUrl(sender?.icon_file);

  // const handleBubbleReply = (message) => {
  //   onReply(message);
  // };

  return (
    <div
      className={`flex ${
        fromCurrentUser ? "justify-end" : "justify-start"
      } items-start space-x-2`}
    >
      {/* Left side (other user) */}
      {!fromCurrentUser && (
        <div className="flex items-start space-x-2">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={senderAvatar} />
            <AvatarFallback>{getAvatarFallback(senderName)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start">
            {/* Sender name on top */}
            {isRooms && (<span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {senderName}
            </span>)}

            {/* Individual bubble widths */}
            <div className="flex flex-col items-start space-y-1">
              {messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  fromCurrentUser={fromCurrentUser}
                  onReply={onReply}
                  onOpenThread={onOpenThread}
                  onEdit={onEdit}
                />
              ))}
            </div>

            <p className="text-[12px] mt-1 opacity-75">
              {formatTime(messages[messages.length - 1]?.created_at)}
            </p>
          </div>
        </div>
      )}

      {/* Right side (current user) */}
      {fromCurrentUser && (
        <div className="flex flex-col items-end">
          {/* <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            You
          </span> */}

          <div className="flex flex-col items-end space-y-1">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                fromCurrentUser={fromCurrentUser}
                onReply={onReply}
                onOpenThread={onOpenThread}
                onEdit={onEdit}
                editingTo={editingTo}
                // onUnsend={onUnsend}
              />
            ))}
          </div>

          <p className="text-[12px] mt-1 opacity-75">
            {formatTime(messages[messages.length - 1]?.created_at)}
          </p>
        </div>
      )}
    </div>
  );
}
