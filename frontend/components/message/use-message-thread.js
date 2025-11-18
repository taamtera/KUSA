"use client";

import { useState } from "react";

export function useMessageThread() {
    const [threadOpen, setThreadOpen] = useState(false);
    const [threadParent, setThreadParent] = useState(null);
    const [threadReplies, setThreadReplies] = useState([]);
    const [threadLoading, setThreadLoading] = useState(false);

    const openThread = async (parentMsg) => {
        if (!parentMsg?._id) {
            console.warn("openThread called without a valid _id", parentMsg);
            return;
        }
        try {
            setThreadLoading(true);
            setThreadOpen(true);
            setThreadParent(parentMsg);

            const res = await fetch(
                `http://localhost:3001/api/v1/messages/${parentMsg._id}/replies?page=1&limit=50&sort=asc`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (data.status === "success") {
                setThreadReplies(data.replies || []);
            } else {
                setThreadReplies([]);
            }
        } catch (e) {
            console.error("Thread fetch failed:", e);
            setThreadReplies([]);
        } finally {
            setThreadLoading(false);
        }
    };

    const closeThread = () => {
        setThreadOpen(false);
        setThreadReplies([]);
        setThreadParent(null);
    };

    return {
        threadOpen,
        threadParent,
        threadReplies,
        threadLoading,
        openThread,
        closeThread,
    };
}
