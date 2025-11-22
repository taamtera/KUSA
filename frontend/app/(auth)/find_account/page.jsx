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
// import { Label } from "@/components/ui/label"
import { use, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { data } from "autoprefixer";

export default function CardDemo() {
    const [inputUser, setInputUser] = useState("");
    const [found, setFound] = useState(false);
    const [foundUser, setFoundUser] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/find/${inputUser}`, {
                method: "GET",
            });

            const data = await response.json();
            setFoundUser(data.user);
            // console.log(data);

            if (response.ok) {
                // window.location.href = "/recover";
                setFound(true);
                // console.log(response);
            } else {
                alert(data.message);
                router.push('/');
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

    const handleSecondSubmit = async (e) => {
        e.preventDefault();

        try {
            // window.location.href = "/recover";
            router.push(`/recover?email=${foundUser.email}`);
        } catch (err) {
            console.log("Error: ", err);
            alert("Something went wrong?");
        }
    }

    const handle2ndKeyPress = (e) => {
        if (e.key == "Enter") {
            e.preventDefault();
            handle2ndKeyPress(e);
        }
    }


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
                            {!found && (
                                <div className="grid gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Username or Email address"
                                        onChange={(e) => setInputUser(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            {found && (
                                <div>
                                    <Input
                                        value={inputUser}
                                        disabled
                                    />
                                </div>
                            )}
                        </div>
                    </form>
                </CardContent>
                {!found && (<CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        className="w-full bg-gray-400 hover:bg-gray-500 text-white border-none cursor-pointer"
                        onClick={handleSubmit}
                        onKeyDown={handleKeyPress}
                    >
                        Continue
                    </Button>
                </CardFooter>)}
                {found && (
                    <div>
                        {/* show user profile */}
                        <CardContent>
                            Is this your account?
                            <div className="boarder border-gray-400">
                                <div className="flex items-center gap-3 pt-3">
                                    <Avatar className="h-15 w-15">
                                        <AvatarImage src="https://github.com/shadcn.png" /> 
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium">{foundUser?.username}</span>
                                        <span className="text-xs text-muted-foreground">@{foundUser?.display_name}</span>
                                        <span className="text-xs text-muted-foreground">{foundUser?.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end content-end gap-2 pt-4">
                                <Button type="button" variant="outline" className="cursor-pointer bg-transparent" onClick={() => setFound(false)}>
                                    No
                                </Button>
                                <Button type="submit" className="cursor-pointer" onClick={handleSecondSubmit} onKeyDown={handle2ndKeyPress}>
                                    Yes
                                </Button>
                            </div>
                        </CardContent>
                    </div>
                )}
            </Card>
        </div>
    )
}
