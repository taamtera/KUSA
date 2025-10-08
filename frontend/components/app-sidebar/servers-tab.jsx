"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export function ServersTab({ user }) {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/v1/servers", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.status === "success") {
          setServers(data.servers);
          // console.log("Fetched servers:", data.servers); // Testing purpose
        }
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };
    if (user) fetchServers();
  }, [user]);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {servers.map((server) => (
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
                        <a href="#" className="pl-8 text-sm text-muted-foreground hover:text-foreground">
                          #{room.title}
                        </a>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}