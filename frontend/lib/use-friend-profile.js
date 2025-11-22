"use client";

import { useState } from "react";

export function useOtherUserProfile() {
    const [profileOpen, setProfileOpen] = useState(false);
    const [otherUserInfo, setOtherUserInfo] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const openProfile = async (user) => {
        if (!user?._id) {
            console.warn("openProfile called without a valid _id", user);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${user._id}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to fetch user");
            }

            setOtherUserInfo(data.user);
            setProfileOpen(true);
        } catch (err) {
            setError(err.message || "Error loading user");
        } finally {
            setLoading(false);

        }
    }

    const closeProfile = () => {
        setProfileOpen(false);
        setOtherUserInfo(null);
        setError("");
    };

    return {
        profileOpen,
        setProfileOpen,
        openProfile,
        otherUserInfo,
        closeProfile,
    };
}

