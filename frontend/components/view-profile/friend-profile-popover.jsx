"use client"

import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
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

export default function FriendProfile({ otherUserInfo, closeProfile }) {

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

                <div className="absolute top-[80px] right-[16px]">
                    <div className="flex gap-2">
                        <Button
                            onClick={closeProfile}
                            className="
                                w-[36px]
                                outline-none
                                rounded-[14px]
                                bg-gray-100 border border-gray-700 hover:bg-gray-700 
                                text-gray-900 hover:text-white
                            "
                        >
                            <UserPlus className="size-[16px]" />
                        </Button>
                        <Dialog>
                            <DialogTrigger
                                className="
                                    px-4
                                    rounded-[14px] 
                                    bg-gray-100 border border-gray-700 hover:bg-gray-700
                                    text-gray-900 hover:text-white
                                "
                            >
                                View Full Profile
                            </DialogTrigger>
                            <DialogContent
                                closeButton={false}
                                className="w-[720px] max-w-[90vw] p-0"
                            >

                                <OtherUserFullProfile
                                    otherUserInfo={otherUserInfo}
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

