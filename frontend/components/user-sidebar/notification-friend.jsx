"use client"

import { Button } from "@/components/ui/button"

export function NotificationFriend({ notif, onRemove }) {
    const fromUser = notif.from

    async function handleClick(accept) {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/friend/respond`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({  notificationId: notif._id, accept}),
            })
            onRemove(notif._id)
            window.location.href = "/chats/dms/" + fromUser._id
        } catch (err) {
            console.error("Error accepting friend:", err)
        }
    }

    return (
        <div className="border rounded-lg p-3 text-sm flex flex-col gap-2 hover:bg-muted/40 transition">
            <div className="flex items-center gap-2">
                {fromUser?.icon_file?.storage_key ? <img src={fromUser.icon_file.storage_key} alt="User icon" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{fromUser?.username?.[0]?.toUpperCase() || "?"}</div>}
                <div className="flex-1">
                    <strong>{fromUser?.username}</strong> <span className="text-muted-foreground">sent you a friend request</span>
                </div>
            </div>

            <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className=" hover:bg-green-600 border-green-500 text-green-600 hover:text-white " onClick={() => handleClick(true)}>
                    Accept
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-red-600 border-red-300 text-red-600 hover:text-white" onClick={() => handleClick(false)}>
                    Decline
                </Button>
            </div>
        </div>
    )
}
