'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";

export default function CardDemo() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Email:", email);
        console.log("Password:", password);

        try {
            const response = await fetch("http://localhost:3001/api/v1/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                console.log("Redirecting to /chats");
                window.location.href = "/chats";
            } else {
                alert("❌ " + data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Forgotten Password</CardTitle>
                    <CardDescription>
                        Please enter your username or email address to search for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                {/* <Label htmlFor="email">Email</Label> */}
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Username or Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        className="w-full bg-gray-400 hover:bg-gray-500 text-white border-none cursor-pointer"
                        onClick={handleSubmit}
                    >
                        Continue
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
