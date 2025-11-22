"use client";

import { X, User } from "lucide-react";
import { Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose 
} from "@/components/ui/dialog";

export default function MessageThread({ threadOpen, onthreadOpen, threadParent, threadLoading, threadReplies, closeThread}) {
    const isParentUnsent = threadParent && threadParent.active === false;


    return (
        <Dialog open={threadOpen} onOpenChange={onthreadOpen}>
            <DialogContent className="gap-0 px-0 max-w-[90vw] w-[500px] max-h-[60vh] flex flex-col">
                <DialogHeader className="flex items-start justify-between px-4 py-3 border-b">
                    <DialogTitle className="flex-1 min-w-0 text-sm font-semibold break-all">
                        Thread • Reply to {threadParent?.sender?.display_name || threadParent?.sender?.username || "user"}
                    </DialogTitle>
                </DialogHeader>

                {/* parent message */}
                {threadParent && (
                    <div className={`px-4 pt-3 pb-2 border-b bg-gray-100 ${isParentUnsent ? "italic text-gray-500" : "text-gray-900"}`}>
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

                <div className="px-3 overflow-y-auto space-y-2">
                    {threadLoading ? (
                        <div className="text-sm text-gray-500">Loading replies…</div>
                    ) : threadReplies.length === 0 ? (
                        <div className="text-sm text-gray-500">No replies yet.</div>
                    ) : (
                        threadReplies.map((msg) => (
                            <div key={msg._id} className={`px-4 py-3 border-b ${msg.active ? "text-gray-900" : "italic text-gray-500"}`}>
                                <div className="flex text-xs mb-1 gap-2 justify-between">
                                    <span className="flex-1 min-w-0 whitespace-pre-wrap items-center gap-1 break-words">
                                        {msg.sender?.display_name || msg.sender?.username || "user"}
                                    </span>
                                    { msg.active && (<p className="flex items-start text-gray-500">{msg.edited_count > 0 ? "edited" : ""}</p>)}
                                </div>
                                <div className="text-sm whitespace-pre-wrap">
                                    {msg.active ? msg.content : "This message was unsent."}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <DialogClose onClick={closeThread}/>
            </DialogContent>
        </Dialog>
    )
}