"use client";

import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function ServerCard({ server }) {


  return (
    <Collapsible key={server._id} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <Avatar className="h-6 w-6">
              <AvatarImage src={server.icon_file?.url || ""} />
              <AvatarFallback>
                {server.server_name[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="ml-2">{server.server_name}</span>
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {server.rooms?.map((room) => (
              <SidebarMenuSubItem key={room._id}>
                <SidebarMenuButton asChild>
                  <Link
                    href={`/chats/rooms/${room._id}`}
                    className="pl-8 text-sm text-muted-foreground hover:text-foreground cursor-pointer block w-full text-left"
                  >
                    #{room.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
