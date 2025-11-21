// 'use client'

// import { Button } from "@/components/ui/button"
// import {
//     Card,
//     CardAction,
//     CardContent,
//     CardDescription,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useState } from "react";

// export default function CardDemo() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         console.log("Email:", email);
//         console.log("Password:", password);

//         try {
//             const response = await fetch("http://localhost:3001/api/v1/login", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 credentials: 'include',
//                 body: JSON.stringify({ email, password }),
//             });

//             const data = await response.json();
//             console.log(data);

//             if (response.ok) {
//                 console.log("Redirecting to /chats");
//                 window.location.href = "/chats";
//             } else {
//                 alert("❌ " + data.message);
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             alert("No user found!");
//         }
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === "Enter") {
//             e.preventDefault();
//             handleSubmit(e);
//         }
//     };


//     return (
//         <div className="flex min-h-screen items-center justify-center">
//             <Card className="w-full max-w-sm">
//                 <CardHeader>
//                     <CardTitle>Reset Your Password</CardTitle>
//                     Is this your account?
//                 </CardHeader>
//                 <CardContent>
//                     <form>
//                         <div className="flex flex-col gap-6">
//                             <div>
//                                 //
//                             </div>
//                             <div className="grid gap-2">
//                                 <Label htmlFor="email">Email</Label>
//                                 <Input
//                                     id="email"
//                                     type="email"
//                                     placeholder="m@example.com"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     required
//                                 />
//                             </div>
//                             <div className="grid gap-2">
//                                 <div className="flex items-center">
//                                     <Label htmlFor="password">Password</Label>
//                                     <a
//                                         href="/find_account"
//                                         className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-gray-500"
//                                     >
//                                         Forgot your password?
//                                     </a>
//                                 </div>
//                                 <Input
//                                     id="password"
//                                     type="password"
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     required
//                                     onKeyDown={handleKeyPress} />
//                             </div>
//                         </div>
//                     </form>
//                 </CardContent>
//                 <CardFooter className="flex-col gap-2">
//                     <Button
//                         type="submit"
//                         className="w-full bg-gray-400 hover:bg-gray-500 text-white border-none cursor-pointer"
//                         onClick={handleSubmit}
//                     >
//                         Login
//                     </Button>
//                 </CardFooter>
//             </Card>
//         </div>
//     )
// }
