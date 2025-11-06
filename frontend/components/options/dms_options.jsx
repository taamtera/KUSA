"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function DMsOptions({ open, onOpenChange, otherUserId }) {
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleUnfriend = async () => {
        if (!otherUserId) return
        setLoading(true)
        setMessage("")

        try {
            const res = await fetch("http://localhost:3001/api/v1/friend/remove", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendId: otherUserId }),
            })

            const data = await res.json()
            if (res.ok) {
                setMessage("Friend successfully removed.")
            } else {
                setMessage(data.message || "Failed to remove friend.")
            }
        } catch (err) {
            console.error("Error removing friend:", err)
            setMessage("Failed to remove friend due to a network error.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">DM Options</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <Button variant="destructive" className="w-full" disabled={loading} onClick={handleUnfriend}>
                        {loading ? "Removing..." : "Unfriend"}
                    </Button>

                    <div className={`text-sm ${message?.includes("removed") ? "text-green-600" : "text-red-600"}`}>{message && message}</div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
