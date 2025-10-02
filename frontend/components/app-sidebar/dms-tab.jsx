"use client";
import { useEffect, useState } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// const DMs = [
//   { title: "Daniel", url: "#", avatar: { src: "https://github.com/shadcn.png", fallback: "HM" } },
//   { title: "Malcolm", url: "#", avatar: { src: "https://github.com/vercel.png", fallback: "IN" } },
//   { title: "Alex", url: "#", avatar: { src: "https://github.com/nextjs.png", fallback: "CA" } },
// ];

export function DMsTab({ user }) {

    useEffect(() => {
    if (user) {
      for (const dm of user.friends) {
        console.log(dm);
      }
    }
  }, [user]);
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {user && (
            console.log(user)
          )}
          {/* {DMs.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.avatar.src} />
                    <AvatarFallback>{item.avatar.fallback}</AvatarFallback>
                  </Avatar>
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))} */}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}