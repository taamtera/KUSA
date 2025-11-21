"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import pbanner from "@/components/img/pbanner.jpg";

export default function OtherUserFullProfile({ otherUserInfo }) {

    return (
        <div className="relative">
            <div className="relative p-1">
                <div>
                    <Image
                        src={pbanner}
                        className="object-contain rounded-lg"
                    />
                </div>

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

                <h2 className="text-2xl font-bold mb-4">
                    {otherUserInfo?.display_name || otherUserInfo?.username || "User"}
                </h2>
                <p className="mb-2">{otherUserInfo?.username}</p>
                <p className="mb-2">{otherUserInfo?.pronouns}</p>
                <p className="mb-2">{otherUserInfo?.bio || "No bio available."}</p>
                {/* Add more fields as necessary */}
            </div>
        </div>
    )
}