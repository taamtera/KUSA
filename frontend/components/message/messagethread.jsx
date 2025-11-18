"use client";

import { X } from "lucide-react";

export default function MessageThread({ threadParent, threadLoading, threadReplies, closeThread}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[min(92vw,520px)] max-h-[70vh] bg-white rounded-2xl shadow-xl flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="text-sm font-semibold">
                        Thread • Reply to {threadParent?.sender?.nickname || threadParent?.sender?.user?.display_name || threadParent?.sender?.user?.username || "user"}
                    </div>
                    <button onClick={closeThread} className="p-1 rounded hover:bg-gray-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* parent message */}
                {threadParent && (
                    <div className="px-4 pt-3 pb-2 bg-gray-50">
                        <div className="text-xs text-gray-600 mb-1">
                            {threadParent?.sender?.user?.display_name || threadParent?.sender?.user?.username || "user"}
                        </div>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                            {threadParent.content}
                        </div>
                    </div>
                )}

                <div className="px-4 py-3 border-t overflow-y-auto space-y-2">
                    {threadLoading ? (
                        <div className="text-sm text-gray-500">Loading replies…</div>
                    ) : threadReplies.length === 0 ? (
                        <div className="text-sm text-gray-500">No replies yet.</div>
                    ) : (
                        threadReplies.map((msg) => (
                            <div key={msg._id}>
                                <div className="text-xs text-gray-600">
                                    {msg.sender?.user?.display_name || msg.sender?.user?.username || "user"}
                                </div>
                                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}