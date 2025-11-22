"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
    const params = useParams();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Get token from URL params on client side
    useEffect(() => {
        if (params?.token) {
            setToken(params.token);
        }
    }, [params]);

    async function handleSubmit() {
        if (!token) {
            setMessage("Token is missing");
            return;
        }

        if (!password) {
            setMessage("Please enter a password");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            console.log("Sending request with token:", token);

            if (password.length < 8) {
                setError("New password must be at least 8 characters.");
                return;
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/account/reset-password-via-token`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ 
                    token: token,
                    password: password 
                }),
            });
            
            const data = await response.json();
            console.log("Response status:", response.status);
            console.log("Response data:", data);
            
            if (response.ok) {
                setMessage("Password reset successfully! Redirecting to login...");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                setMessage(data.message || "Failed to reset password");
            }
        } catch (error) {
            console.error("Network error:", error);
            setMessage("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="max-w-md mx-auto mt-8 p-6">
                <p>Loading token...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-6">
            <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
            <p className="text-sm text-gray-600 mb-4">Token: {token.substring(0, 10)}...</p>
            <input 
                type="password" 
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-2 border rounded mb-4"
            />
            <Button 
                className="cursor-pointer w-full" 
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
            {message && (
                <p className={`mt-4 ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}
        </div>
    );
}