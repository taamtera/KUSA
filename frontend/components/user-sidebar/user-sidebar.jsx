"use client"

import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Bell } from "lucide-react"
import { useEffect, useState } from "react"
import { NotificationFriend } from "./notification-friend"
import { NotificationMention } from "./notification-mention"

export function UserSidebar() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications`, {
          credentials: "include",
        })
        const data = await res.json()

        setNotifications(data.notifications)
        console.log(data)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      }
    }
    fetchNotifications()
  }, [])

  const handleRemoveNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n._id !== id))

  return (
    <Sidebar side="right" className="w-70 pl-6 border-none">
      <SidebarContent className="p-4 space-y-4 border-l">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Notifications</span>
          </div>
          <Switch />
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="text-center text-sm font-medium text-muted-foreground">
            You have no new notifications.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              if (notif.type === "FRIEND_REQUEST") {
                return (
                  <NotificationFriend
                    key={notif._id}
                    notif={notif}
                    onRemove={handleRemoveNotification}
                  />
                )
              } else if (notif.type === "MENTION") {
                return (
                  <NotificationMention
                    key={notif._id}
                    notif={notif}
                    onRemove={handleRemoveNotification}
                  />
                )
              }
              return null
            })}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
