"use client"

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";
import Image from 'next/image';
import pbanner from "@/components/img/pbanner.jpg";

export default function FriendProfile({ open, onOpenChange, friend }) {

    const [friendInfo, setFriendInfo] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    console.log("MessageGroup friend:", friend._id);

    useEffect(() => {
        if (!friend._id) return; // nothing to load

        let cancelled = false;
        setLoading(true);
        setError("");

        const loadUser = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/v1/users/${friend._id}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                    },
                });

                const data = await res.json(); // { status, user } or { message }
                console.log("FriendProfile loadUser data:", data);
                
                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch user");
                }

                if (!cancelled) {
                    setFriendInfo(data.user); // safeUser from backend
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Error loading user");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadUser();

        // cleanup if component unmounts or friend._id changes fast
        return () => {
            cancelled = true;
        };
    }, [friend._id]);

    // console.log("FriendProfile friendInfo:", friendInfo);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{friend.display_name}'s Profile</DialogTitle>
                </DialogHeader>

                <Image
                    src={pbanner}
                    alt="Profile Banner"
                    className="w-full h-full object-cover flex"
                />

                <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0">
                        <Avatar className="w-24 h-24 border-4 border-white">
                            <AvatarImage src={friend.icon_file?.storage_key} />
                            <AvatarFallback>{friend.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <Button type="Button" className="mt-4 w-full">Add Friend</Button>
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                        {friend.display_name && (
                            <p><span>Name: </span>{friend.display_name}</p>
                        )}
                        {friend.bio && (
                            <p><span>Bio: </span>{friend.bio}</p>
                        )}
                        {friend.gender && (
                            <p><span>Gender: </span>{friend.gender}</p>
                        )}
                        {friend.faculty && (
                            <p><span>Faculty: </span>{friend.faculty}</p>
                        )}
                        {friend.major && (
                            <p><span>Major: </span>{friend.major}</p>
                        )}
                        {friend.email && (
                            <p><span>Email: </span>{friend.email}</p>
                        )}
                        {friend.phone_number && (
                            <p><span>Phone: </span>{friend.phone_number}</p>
                        )}
                    </div>

                </div>

                <DialogClose asChild>
                    <Button type="button" className="absolute right-4 top-4">✕</Button>
                </DialogClose>

            </DialogContent>
        </Dialog>
    )
}
