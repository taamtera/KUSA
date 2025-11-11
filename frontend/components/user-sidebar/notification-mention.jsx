"use client"

import { Button } from "@/components/ui/button"

export function NotificationMention({ notif, onRemove }) {
    const fromUser = notif.from


    async function handleClick(accept) {
        try {
            await fetch("http://localhost:3001/api/v1/notification/respond", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: notif._id, accept }),
            })
            onRemove(notif._id)
        } catch (err) {
            console.error("Error responding to notification:", err)
        }

        if (!notif.location) return

        if (notif.location.context_type === "Room") {
            window.location.href = `/chats/rooms/${notif.location.context}`
        } else if (notif.location.context_type === "User") {
                window.location.href = `/chats/dms/${notif.from._id}`
        }
    }

    return (
        <div className="border rounded-lg p-3 text-sm flex flex-col gap-2 hover:bg-muted/40 transition">
            <div className="flex items-center gap-2">
                {fromUser?.icon_file?.storage_key ? <img src={fromUser.icon_file.storage_key} alt="User icon" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{fromUser?.username?.[0]?.toUpperCase() || "?"}</div>}
                <div className="flex-1">
                    <strong>{fromUser?.username}</strong> <span className="text-muted-foreground">mentioned you in a message</span>
                </div>
            </div>

            <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className=" hover:bg-green-600 border-green-500 text-green-600 hover:text-white " onClick={() => handleClick(true)}>
                    Go to Message
                </Button>
            </div>
        </div>
    )
}
