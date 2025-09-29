"use client"

import { Sidebar, SidebarContent } from "@/components/ui/sidebar"

export function ChatSidebar() {
  return (
    <Sidebar side="right">
      <SidebarContent className="p-4">
        {/* You can add widgets, online users, or keep this empty for now */}
        <div className="text-sm text-muted-foreground">
          Right sidebar content goes here
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
