"use client"
import { useEffect, useState } from "react"

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl, getAvatarFallback } from "@/components/utils";

export function DMsTab({ user }) {
  const handleFriendClick = (friendId) => {
    // Navigate to the DM page with the selected friend
    window.location.href = `/chats/${friendId}`;
  };

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{user?.friends?.map((friend) => (
            console.log(user),
						<SidebarMenuItem key={friend._id}>
							<SidebarMenuButton
								onClick={() => handleFriendClick(friend._id)}
								className="flex items-center gap-2 cursor-pointer"
							>
								<Avatar className="h-6 w-6">
									<AvatarImage src={getAvatarUrl(friend.icon_file)} />
									<AvatarFallback>
										{getAvatarFallback(friend.username)}
									</AvatarFallback>
								</Avatar>
								<span>{friend.username}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
