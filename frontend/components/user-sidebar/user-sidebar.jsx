"use client"

import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Bell } from "lucide-react"
import { useEffect, useState } from "react"
import { NotificationFriend } from "./notification-friend"

export function UserSidebar() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("http://localhost:3001/api/v1/notifications", {
          credentials: "include",
        })
        const data = await res.json()

        const enriched = await Promise.all(
          (data.notifications || []).map(async (n) => {
            if (n.type === "FRIEND_REQUEST") {
              const profileRes = await fetch(
                `http://localhost:3001/api/v1/users/${n.from}`,
                { credentials: "include" }
              )
              const profileData = await profileRes.json()
              return { ...n, fromUser: profileData.user }
            }
            return n
          })
        )

        setNotifications(enriched)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      }
    }
    fetchNotifications()
  }, [])

  const handleRemoveNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n._id !== id))

  return (
    <Sidebar side="right" className="w-72 border-l">
      <SidebarContent className="p-4 space-y-4">
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
              }
              return null
            })}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
