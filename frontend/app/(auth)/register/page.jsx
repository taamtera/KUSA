'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";

export default function CardDemo() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirmation, setPassword_confirmation] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            if (password.length < 8 || password_confirmation.length < 8) {
                setIsError(true);
                setMessage("Password must be at least 8 characters.");
                return;
            }
            const response = await fetch("http://localhost:3001/api/v1/login/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, username, password, password_confirmation }),
            });


            let data = await response.text();
            try {
                data = JSON.parse(data);
            } catch (jsonError) {
                // If it's plain text (like 400 missing fields response)
                data = { message: data };
            }

            if (response.ok) {
                // Success: Status 200/201 (your backend returns 200 with JSON)
                setIsError(false);
                setMessage(`Registration Success! Welcome, ${username}.`);
                window.location.href = "/login";
            } else {
                // API Error: Status 400, 409, 500
                setIsError(true);
                // Handle different backend error message formats
                if (data.message) {
                    // This handles your 409 (email/username taken) and 500 (unable to register)
                    setMessage(`Registration Failed: ${data.message}`);
                } else if (typeof data.message === 'string') {
                    // This handles your 400 (Missing required fields)
                    setMessage(data.message);
                } else {
                    setMessage(`Registration failed with status: ${response.status}`);
                }
                // alert("❌ " + data.message);
            }


        } catch (error) {
            console.error('Network or unexpected error:', error);
            alert("Something went wrong!");
            setIsError(true);
            setMessage('An unexpected network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#dbdce1]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Display Status Message */}
                    {message && (
                        <p className={`mb-4 text-center p-2 rounded-md ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {message}
                        </p>
                    )}

                    {/* The form structure*/}
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text" // Changed from 'username' to 'text' for proper HTML type
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="confirmation_password">Confirm Password</Label>
                                </div>
                                <Input
                                    id="confirmation_password"
                                    type="password"
                                    value={password_confirmation}
                                    onChange={(e) => setPassword_confirmation(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className='mt-6'>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

}
