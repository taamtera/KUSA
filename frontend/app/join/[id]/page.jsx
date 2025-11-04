"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";


export default function JoinPage({ params }) {
    const { id } = params; // serverId from URL
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    console.log(user);

    const handleJoin = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:3001/api/v1/servers/join", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ serverId: id}),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to join server.");
            }

            // Success → redirect to server page
            router.push(`/chats/rooms/${roomId}`);

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
                <p className="mb-4 text-center">
                    You're about to join the server with ID: <strong>{id}</strong>
                </p>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <button
                    onClick={handleJoin}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded text-white transition duration-200 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        }`}
                >
                    {loading ? "Joining..." : "Proceed to Join"}
                </button>
            </div>
        </div>
    );
}
