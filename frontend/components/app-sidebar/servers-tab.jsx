"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { ServerCard } from "./server-card";

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
            <ServerCard key={server.id ?? server._id ?? server.uuid} server={server} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
