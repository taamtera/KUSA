"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function JoinPage({ params }) {
    const { id } = params;
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Join Server</h1>
                <p className="mb-4 text-center">You're about to join the server with ID: <strong>{id}</strong></p>
                <button
                    // onClick={() => router.push(`/join/${id}/confirm`)}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                >
                    Proceed to Join
                </button>
            </div>
        </div>
    );
}