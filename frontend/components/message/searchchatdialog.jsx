"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarFallback, formatDividerTime } from "@/components/utils"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function SearchChatDialog({ open, onOpenChange, messages, user, otherUser }) {
    const [query, setQuery] = useState("")
    const [executedQuery, setExecutedQuery] = useState("") // only search when executed

    // Only search when executedQuery changes
    const results = useMemo(() => {
        if (!executedQuery.trim()) return []
        return messages.filter((msg) => msg.content.toLowerCase().includes(executedQuery.toLowerCase()))
    }, [executedQuery, messages])

    const handleSearch = () => {
        setExecutedQuery(query)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleSearch()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Search Chat</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search input */}
                    <div className="relative flex items-center">
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Search messages..." className="pr-10" />
                        <Search className="absolute right-3 h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" onClick={handleSearch} />
                    </div>

                    {/* Search results */}
                    {executedQuery ? (
                        <>
                            <p className="text-sm text-gray-500">
                                Found {results.length} {results.length === 1 ? "result" : "results"}
                            </p>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {results.map((msg) => {
                                    const isFromCurrentUser = msg.sender?.user?._id === user?._id
                                    const sender = isFromCurrentUser ? user : otherUser
                                    return (
                                        <div key={msg._id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100 cursor-pointer transition">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`data:${sender.icon_file.mime_type};base64,${sender.icon_file.base64}`} />
                                                <AvatarFallback>{sender.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{isFromCurrentUser ? "You" : sender?.display_name || sender?.username}</span>
                                                <span className="text-xs text-gray-600 truncate">{msg.content}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Type your query and press Enter or click search.</p>
                    )}

                    {/* Cancel button */}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
