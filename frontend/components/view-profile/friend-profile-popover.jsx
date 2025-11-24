"use client"

import { useState, useEffect } from "react";
import { X, UserPlus, HandFist } from "lucide-react";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarFallback, formatTime } from "@/components/utils";
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

export default function FriendProfile({ otherUserInfo, closeProfile, isFriend, handleAddFriend, loading, isPendingRequest }) {

    return (
        <div className="relative">
            {/* Banner + avatar + close button in a relative wrapper */}
            <div className="relative p-1 w-full aspect-[4/1]" >
                {/* <Image
                src={`data:${otherUserInfo.banner_file?.mime_type};base64,${otherUserInfo.banner_file?.base64}`}
                fill
                alt="./banner.png"
                className="object-cover"
                /> */}
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
                    {console.log("otherUserInfo icon file:", otherUserInfo)}
                        <AvatarImage src={`data:${otherUserInfo?.icon_file?.mime_type};base64,${otherUserInfo?.icon_file?.base64}`} />
                        <AvatarFallback>{getAvatarFallback(otherUserInfo?.display_name)}</AvatarFallback>
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
                                    ${isPendingRequest ? "bg-yellow-100 text-yellow-900 bg-yellow-100 border border-yellow-700" : "hover:bg-gray-700 text-gray-900 hover:text-white bg-gray-100 border border-gray-700"}
                                `}
                            >
                                <UserPlus className="size-[14px]" />
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
                                    isPendingRequest={isPendingRequest}
                                    loading={loading}
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

