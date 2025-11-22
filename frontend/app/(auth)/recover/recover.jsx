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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation"

export default function Recover() {
    const params = useSearchParams();
    const email = params.get("email");
    // const [destinationEmail, setDestinationEmail] = useState("");
    const router = useRouter();
    const subject = "Resetting your password"
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/send-email/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    destinationEmail: email, // Use email directly here
                    subject 
                }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                console.log("Email sending!");
                setSent(true);
                // You might want to redirect to a confirmation page
                // window.location.href = "/email-sent";
            } else {
                alert("❌ " + data.message);
                router.push('/login');
            }
        } catch (error) {
            console.error("Error:", error);
            alert("No user found!");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center flex-col">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reset Your Password</CardTitle>
                    How do you want to receive the link to reset your password?
                </CardHeader>
                <CardContent>
                    <form>
                        <div class="relative flex items-start">
                            <input type="radio" name="hs-default-radio" 
                                className="shrink-0
                                    mt-1
                                    border-gray-200 
                                    rounded-full 
                                    text-blue-600 
                                    focus:ring-blue-500 
                                    checked:border-blue-500 
                                    disabled:opacity-50 
                                    disabled:pointer-events-none 
                                    dark:bg-neutral-800 
                                    dark:border-neutral-700 
                                    dark:checked:bg-blue-500 
                                    dark:checked:border-blue-500 
                                    dark:focus:ring-offset-gray-800" 
                                id="hs-default-radio"/>
                            <label for="hs-default-radio" class="text-sm ms-4">
                                <span className="block">Send link via email:</span>
                                <span className="block">{email}</span>
                            </label>
                        </div>

                        <div class="flex mt-3">
                            <input type="radio" name="hs-default-radio"
                                class="shrink-0 
                                    mt-0.5 
                                    border-gray-200 
                                    rounded-full 
                                    text-blue-600 
                                    focus:ring-blue-500 
                                    checked:border-blue-500 
                                    disabled:opacity-50 
                                    disabled:pointer-events-none 
                                    dark:bg-neutral-800 
                                    dark:border-neutral-700 
                                    dark:checked:bg-blue-500 
                                    dark:checked:border-blue-500 
                                    dark:focus:ring-offset-gray-800" 
                                id="hs-checked-radio"/>
                            <label for="hs-checked-radio" class="text-sm ms-4">Enter Password to Log In</label>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        className="w-full bg-gray-400 hover:bg-gray-500 text-white border-none cursor-pointer"
                        onClick={handleSubmit}
                        onKeyDown={handleKeyPress}
                    >
                        Continue
                    </Button>
                </CardFooter>
            </Card>
            {sent && (
                <Card className={"w-full max-w-sm bg-green-200 border-green-600 mt-3"}>
                    <CardHeader className={"text-sm"}>
                        <CardTitle className={"text-base"}> The email has already sent! </CardTitle>
                        The link was sent to the email: {email}
                    </CardHeader>
                </Card>
            )}

        </div>
    )
}
