"use client"

import { Button } from "@/components/ui/button"

export function NotificationFriend({ notif, onRemove }) {
    const fromUser = notif.fromUser

    async function handleAccept() {
        try {
            await fetch("http://localhost:3001/api/v1/friends/accept", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromUserId: notif.from }),
            })
            onRemove(notif._id)
        } catch (err) {
            console.error("Error accepting friend:", err)
        }
    }

    async function handleDecline() {
        try {
            await fetch("http://localhost:3001/api/v1/friends/decline", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromUserId: notif.from }),
            })
            onRemove(notif._id)
        } catch (err) {
            console.error("Error declining friend:", err)
        }
    }

    return (
        <div className="border rounded-lg p-3 text-sm flex flex-col gap-2 hover:bg-muted/40 transition">
            <div className="flex items-center gap-2">
                {fromUser?.icon_file?.url ? <img src={fromUser.icon_file.url} alt="User icon" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{fromUser?.username?.[0]?.toUpperCase() || "?"}</div>}
                <div className="flex-1">
                    <strong>{fromUser?.username}</strong> <span className="text-muted-foreground">sent you a friend request</span>
                </div>
            </div>

            <div className="flex gap-2 justify-end">
                <Button size="sm" variant="default" onClick={handleAccept}>
                    Accept
                </Button>
                <Button size="sm" variant="outline" onClick={handleDecline}>
                    Decline
                </Button>
            </div>
        </div>
    )
}
