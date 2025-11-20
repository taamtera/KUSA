"use client";

import { X, User } from "lucide-react";

export default function MessageThread({ threadParent, threadLoading, threadReplies, closeThread}) {
    const isParentUnsent = threadParent && threadParent.active === false;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[min(92vw,520px)] max-h-[70vh] bg-white rounded-2xl shadow-xl flex flex-col">
                <div className="flex items-start justify-between px-4 py-3 border-b">
                    <div className="flex-1 min-w-0 text-sm font-semibold whitespace-pre-wrap break-words">
                        Thread • Reply to {threadParent?.sender?.display_name || threadParent?.sender?.username || "user"}
                    </div>
                    <button onClick={closeThread} className="flex p-2 cursor-pointer text-gray-500 hover:bg-gray-300/30 rounded-full">
                        <X className="size-[20px]" />
                    </button>
                </div>

                {/* parent message */}
                {threadParent && (
                    <div className={`px-4 pt-3 pb-2 bg-gray-50 ${isParentUnsent ? "italic text-gray-500" : "text-gray-900"}`}>
                        <div className="flex text-xs mb-1 gap-2 justify-between">
                            <span className="flex-1 min-w-0 whitespace-pre-wrap items-center gap-1 break-words">
                                {threadParent?.sender?.display_name || threadParent?.sender?.username || "user"}
                            </span>
                            { !isParentUnsent && (<p className="flex items-start text-gray-500">{threadParent.edited_count > 0 ? "edited" : ""}</p>)}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                            { !isParentUnsent ? threadParent.content : "This message was unsent."}
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
                            <div key={msg._id} className={`${msg.active ? "text-gray-900" : "italic text-gray-500"}`}>
                                <div className="flex text-xs mb-1 gap-2 justify-between">
                                    <span className="flex-1 min-w-0 whitespace-pre-wrap items-center gap-1 break-words">
                                        {msg.sender?.display_name || msg.sender?.username || "user"}
                                    </span>
                                    { msg.active && (<p className="flex items-start text-gray-500">{msg.edited_count > 0 ? "edited" : ""}</p>)}
                                </div>
                                <div className="text-sm whitespace-pre-wrap">
                                    {msg.active ? msg.content : "This message was unsent."}
                                    <hr className="my-1" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}