"use client"

import { Baby, BookOpen, CalendarDays, Mail, Phone, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import TimeTableGrid from "@/components/timetable/timetablegrid";
import Image from "next/image";
import pbanner from "@/components/img/pbanner.jpg";

export default function OtherUserFullProfile({ otherUserInfo, isFriend, handleAddFriend, isPendingRequest, loading }) {
    const birthday = otherUserInfo?.birthday ? new Date(otherUserInfo.birthday) : null;
    const formattedBirthday = birthday
        ? birthday.toLocaleDateString("en-GB")
        : "";

    const joinedDate = otherUserInfo?.created_at ? new Date(otherUserInfo.created_at) : null;
    const formattedJoinedDate = joinedDate
        ? joinedDate.toLocaleDateString("en-GB")
        : "";

    return (
        <div className="relative flex flex-col h-full">
            <div className="relative">
                {/* Banner + avatar */}
                <div className="relative mb-8">
                    <Image
                        src={pbanner}
                        alt="Profile banner"
                        className="w-full max-w-full aspect-[4/1] object-cover rounded-lg"
                    />

                    <Avatar
                        className="
                            size-[72px]
                            absolute left-4 bottom-0 translate-y-1/3
                            outline outline-4 outline-white
                            "
                    >
                        <AvatarImage src={otherUserInfo?.icon_file?.storage_key} />
                        <AvatarFallback>
                            {otherUserInfo?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>

                </div>

                {/* Content */}
                <div className="relative flex-1 px-6">
                    {!isFriend && (<Button
                        onClick={handleAddFriend}
                        disabled={loading || isPendingRequest}
                        className={`
                            absolute right-8 -top-6 h-[36px] 
                            outline-none rounded-[10px] 
                            ${isPendingRequest ? "bg-yellow-100 text-yellow-900 bg-yellow-100 border border-yellow-700" : "hover:bg-gray-700 text-gray-900 hover:text-white bg-gray-100 border border-gray-700"}`}
                    >
                        <UserPlus className="size-[18px]" /> { isPendingRequest ? "Pending" : "Add Friend"}
                    </Button>)}

                    <h2 className="text-2xl font-bold break-words">
                        {otherUserInfo?.display_name || otherUserInfo?.username || "User"}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 min-w-0">
                        <p className="text-sm text-gray-700 break-words min-w-0">
                            {otherUserInfo?.username}
                        </p>
                        {otherUserInfo?.pronouns && (
                            <>
                                <span className="text-gray-700">•</span>
                                <p className="text-sm text-gray-700 break-words min-w-0">
                                    {otherUserInfo?.pronouns}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col">
                        {otherUserInfo?.email && (<p className="inline-flex items-center mb-2 text-sm text-gray-800 whitespace-pre-wrap break-words">
                            <Mail className="size-[16px] mr-2"/>{otherUserInfo?.email}
                        </p>)}

                        {otherUserInfo?.phone && (<p className="inline-flex items-center mb-2 text-sm text-gray-800 whitespace-pre-wrap break-words">
                            <Phone className="size-[16px] mr-2"/>{otherUserInfo?.phone}
                        </p>)}
                    </div>

                    <p className="mb-2 text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {otherUserInfo?.bio || "No bio available."}
                    </p>

                    {/* Birthday + faculty/major row that can wrap on small widths */}
                    <div className="flex flex-wrap gap-x-4 mt-2">
                        {formattedBirthday && (
                            <div className="flex flex-row text-sm text-gray-700 gap-1 items-center break-words">
                                <Baby className="size-[16px] mr-1" />
                                <p className="">
                                    {formattedBirthday}
                                </p>
                            </div>
                        )}

                        {(otherUserInfo?.faculty || otherUserInfo?.major) && (
                            <div className="inline-flex flex-wrap gap-1 items-center text-sm text-gray-700 break-words">
                                <BookOpen className="size-[16px] mr-1" />
                                <p className="mr-1 break-words min-w-0">
                                    {otherUserInfo?.faculty}
                                </p>
                                <p className="break-words min-w-0">
                                    {otherUserInfo?.major}
                                </p>
                            </div>
                        )}
                        {formattedJoinedDate && (
                            <div className="flex flex-row text-sm text-gray-700 gap-1 items-center break-words">
                                <CalendarDays className="size-[16px] mr-1" />
                                <p className="">
                                    Joined {formattedJoinedDate}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Timetable Section */}
                    {otherUserInfo?.timetable_visibility === "public" && (<div className="mt-6">
                        <TimeTableGrid
                            propUserId={otherUserInfo?._id}
                            onEditSlot={null}     // disables editing for other users
                            fromViewProfile={true}
                        />
                    </div>)}
                </div>
            </div>
        </div>
    );
}
