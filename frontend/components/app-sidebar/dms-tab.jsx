"use client";
import Link from "next/link";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarFallback } from "@/components/utils";

export function DMsTab({ user }) {
	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{user?.friends?.map((friend) => (
						<SidebarMenuItem key={friend._id}>
							<SidebarMenuButton asChild>
								<Link
									href={`/chats/dms/${friend._id}`}
									className="flex items-center gap-2 cursor-pointer"
								>
									<Avatar className="h-6 w-6">
										<AvatarImage src={getAvatarUrl(friend.icon_file)} />
										<AvatarFallback>
											{getAvatarFallback(friend.username)}
										</AvatarFallback>
									</Avatar>
									<span>{friend.username}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
