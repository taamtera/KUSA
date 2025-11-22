"use client"

import { useState, useEffect } from "react";
import { X, UserPlus, HandFist } from "lucide-react";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";
import Image from 'next/image';
import pbanner from "@/components/img/pbanner.jpg";
import OtherUserFullProfile from "@/components/view-profile/friend-full-profile";
import { sendFriendRequest } from "@/lib/use-send-add-friend";

export default function FriendProfile({ otherUserInfo, closeProfile, isFriend }) {

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPendingRequest, setIsPendingRequest] = useState(false);

    const handleAddFriend = async () => {
        if (!otherUserInfo?.username) return;
        if (isPendingRequest || isFriend) return; // safety guard

        setLoading(true);
        try {
            const data = await sendFriendRequest(otherUserInfo.username);
            setMessage(data?.message || null);

            if (
                data?.status === "success" &&
                (data.message === "Friend request sent" ||
                    data.message === "Friend request already sent")
            ) {
                setIsPendingRequest(true);
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to send friend request");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="relative">
            {/* Banner + avatar + close button in a relative wrapper */}
            <div className="relative p-1">
                <Image
                    src={pbanner}
                    alt="Profile Banner"
                    className="w-[320px] h-[96px] object-cover rounded-[8px]"
                />

                {/* Avatar overlapping banner */}
                <Avatar
                    className="
                        size-[48px]
                        absolute left-[16px] top-[72px]
                        outline outline-4 outline-white
                    "
                >
                    <AvatarImage src={otherUserInfo?.icon_file?.storage_key} />
                    <AvatarFallback>
                        {otherUserInfo?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>

                <div className="absolute top-[104px] right-[16px]">
                    <div className="flex gap-2">
                        {!isFriend && (
                            <Button
                                onClick={handleAddFriend}
                                disabled={loading || isPendingRequest}
                                className={`
                                    size-[28px]
                                    outline-none
                                    rounded-[10px]
                                    bg-gray-100 border border-gray-700
                                    ${isPendingRequest ? "cursor-default opacity-70" : "hover:bg-gray-700 text-gray-900 hover:text-white"}
                                `}
                                title={
                                    isPendingRequest
                                        ? "Friend request pending"
                                        : "Add friend"
                                }
                            >
                                {isPendingRequest ? (
                                    // Pending icon / indicator
                                    <HandFist className="size-[14px]" />
                                ) : (
                                    <UserPlus className="size-[14px]" />
                                )}
                            </Button>
                        )}

                        <Dialog>
                            <DialogTrigger>
                                <div
                                    // onClick={() => setPopoverProfile(false)}
                                    className="
                                    flex items-center
                                    px-2 h-[28px]
                                    rounded-[10px] 
                                    bg-gray-100 border border-gray-700 hover:bg-gray-700
                                    text-[14px] text-gray-900 hover:text-white
                                ">
                                    View Full Profile
                                </div>
                            </DialogTrigger>
                            <DialogContent
                                closeButton={false}
                                className="w-[840px] max-w-[90vw] max-h-[80vh] p-1 pb-4 flex flex-col overflow-y-auto"
                            >
                                <OtherUserFullProfile
                                    otherUserInfo={otherUserInfo}
                                    isFriend={isFriend}
                                    handleAddFriend={handleAddFriend}
                                />

                            </DialogContent>
                        </Dialog>

                    </div>
                </div>

            </div>

            {/* Content below (add padding-top to avoid overlapping text) */}
            <div className="flex items-start px-[16px] pb-[16px] pt-[24px]">
                <div className="flex flex-col text-sm">
                    <p className="text-lg font-bold">
                        {otherUserInfo?.display_name}
                    </p>
                    <div className="flex flex-row">
                        <p className="text-sm text-gray-500">
                            {otherUserInfo?.username}
                        </p>
                        <span className="mx-1 text-gray-400">•</span>
                        <p className="text-sm text-gray-500">
                            {otherUserInfo?.pronouns}
                        </p>
                    </div>
                    <p className="slot-card-title text-sm mt-2 text-gray-700 whitespace-pre-wrap">
                        {otherUserInfo?.bio}
                    </p>
                </div>
            </div>
        </div>
    );
}

