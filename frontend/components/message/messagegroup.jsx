"use client"

import MessageBubble from "./messagebubble";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarFallback, formatTime } from "@/components/utils";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import FriendProfile from "@/components/view-profile/friend-profile-popover";
import { useState, useEffect } from "react";
import { useOtherUserProfile } from "../../lib/use-friend-profile";
import { useUser } from "@/context/UserContext"

export default function MessageGroup({ sender, messages, fromCurrentUser, onReply, onOpenThread, onEdit, editingTo, isRooms }) {
  const senderName = fromCurrentUser
    ? "You"
    : sender?.display_name || sender?.username || "User";
  const senderAvatar = fromCurrentUser ? null : getAvatarUrl(sender?.icon_file);

  const { user } = useUser();
  const isFriend = !!user?.friends?.some(
    (f) => f._id === sender._id
  );

  const {
    profileOpen,
    setProfileOpen,
    openProfile,
    otherUserInfo,
    closeProfile,
  } = useOtherUserProfile();

  const handleProfileOpen = () => {
    if (openProfile) openProfile(sender);
  }

  return (
    <div
      className={`flex ${fromCurrentUser ? "justify-end" : "justify-start"
        } items-start space-x-2`}
    >

      {/* Left side (other user) */}
      {!fromCurrentUser && (
        <div className="flex items-start space-x-2">
          <Popover open={profileOpen} onOpenChange={setProfileOpen}>
            <PopoverTrigger asChild>
              <Avatar className="w-10 h-10 shrink-0 cursor-pointer" onClick={handleProfileOpen}>
                <AvatarImage src={senderAvatar} />
                <AvatarFallback>{otherUserInfo?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="relative z-50 w-[256px] max-w-[50vw] min-w-[320px] max-h-[80vh] rounded-[8px] outline-none bg-white transparent shadow-[0_0px_15px_-3px] shadow-gray-400">
              <FriendProfile
                otherUserInfo={otherUserInfo}
                closeProfile={closeProfile}
                isFriend={isFriend}
              />
            </PopoverContent>
          </Popover>

          <div className="flex flex-col items-start">
            {/* Sender name on top */}
            {isRooms && (<span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 cursor-pointer hover:underline hover:font-[1000]" onClick={handleProfileOpen}>
              {senderName}
            </span>)}

            {/* Individual bubble widths */}
            <div className="flex flex-col items-start space-y-1">
              {messages.map((message) => (
                <MessageBubble key={message._id} message={message} fromCurrentUser={fromCurrentUser} onReply={onReply} onOpenThread={onOpenThread} onEdit={onEdit} />
              ))}
            </div>

            <p className="text-[12px] mt-1 opacity-75">{formatTime(messages[messages.length - 1]?.created_at)}</p>
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

          <p className="text-[12px] mt-1 opacity-75">{formatTime(messages[messages.length - 1]?.created_at)}</p>
        </div>
      )}
    </div>
  )
}
