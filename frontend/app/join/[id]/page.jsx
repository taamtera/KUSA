"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function JoinPage({ params }) {
    // ✅ unwrap the params Promise
    const { id } = use(params);

    const { user } = useUser();
    const router = useRouter();

    const [serverName, setServerName] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServer = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servers/${id}`, {
                    credentials: "include"
                });

                const data = await res.json();
                if (res.ok && data.server) {
                    setServerName(data.server.server_name);
                } else {
                    setError("Server not found.");
                }
            } catch (err) {
                setError("Failed to load server details.");
            }
        };

        fetchServer();
    }, [id]);

    const handleJoin = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servers/join`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ serverId: id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to join server.");
            }

            // ✅ Redirect to the room with lowest order
            if (data.firstRoomId) {
                router.push(`/chats/rooms/${data.firstRoomId}`);
            } else {
                // If a server somehow has no rooms
                router.push(`/chats/rooms/`);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Join Server</h1>

                {serverName ? (
                    <p className="mb-4 text-center">
                        You're about to join: <strong>{serverName}</strong>
                    </p>
                ) : (
                    <p className="mb-4 text-center text-gray-500">Loading server info...</p>
                )}

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <button
                    onClick={handleJoin}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded text-white transition duration-200 ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                    {loading ? "Joining..." : "Proceed to Join"}
                </button>
            </div>
        </div>
    );
}
