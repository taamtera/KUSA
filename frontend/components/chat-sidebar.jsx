"use client"

import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Bell, Image, Play, Link, Paperclip } from "lucide-react"

export function ChatSidebar() {
  return (
    <Sidebar side="right" className="w-64 border-l">
      <SidebarContent className="p-4 space-y-4">
        {/* Menu items */}
        {/* <div className="space-y-3 border-b pb-4">
          <div className="flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span className="text-sm">Photos</span>
          </div>
          <div className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span className="text-sm">Videos</span>
          </div>
          <div className="flex items-center space-x-2">
            <Link className="h-4 w-4" />
            <span className="text-sm">Links</span>
          </div>
          <div className="flex items-center space-x-2">
            <Paperclip className="h-4 w-4" />
            <span className="text-sm">Files</span>
          </div>
        </div> */}

        {/* Notifications toggle */}
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Notifications</span>
          </div>
          <Switch />
        </div>

        <div className="text-center text-sm font-medium text-muted-foreground">
          You have no new notifications.
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
