"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { X } from "lucide-react";

export default function MessageReply({ replyingTo, onCancel}) {
    if (!replyingTo) return null;
    return (
        <div className="p-4 border-t bg-white flex items-end gap-2 shrink-0">
            <div className="text-3xl px-3">↰</div>
            <div className="flex-1 w-[16px]">
                <div className="text-sm text-gray-500 font-medium">
                    Replying to {replyingTo.sender?.user?.username || "user"}
                </div>
                <div className="text-sm text-gray-600 truncate w-auto">
                    {replyingTo.content}
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={onCancel}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    )
}