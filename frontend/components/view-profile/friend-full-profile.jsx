"use client"

import { Baby, BookOpen, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import pbanner from "@/components/img/pbanner.jpg";

export default function OtherUserFullProfile({ otherUserInfo }) {
  const birthday = otherUserInfo?.birthday ? new Date(otherUserInfo.birthday) : null;
  const formattedBirthday = birthday
    ? birthday.toLocaleDateString("en-GB")
    : "";

    const joinedDate = otherUserInfo?.created_at ? new Date(otherUserInfo.created_at) : null;
    const formattedJoinedDate = joinedDate
      ? joinedDate.toLocaleDateString("en-GB")
        : "";

    console.log(otherUserInfo);
    console.log("Joined Date:", otherUserInfo?.created_at,formattedJoinedDate);

  return (
    <div className="relative flex flex-col h-full">
      <div className="relative p-1 pb-4">
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
        <div className="flex-1 px-6 overflow-y-auto max-h-[40vh]">
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
        </div>
      </div>
    </div>
  );
}
