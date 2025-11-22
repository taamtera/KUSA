"use client"

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import TimeTable from "../../../components/timetable/timetable";
import pbanner from "@/components/img/pbanner.jpg";
import InfoCard from "./infoCard";
import { useUser } from "@/context/UserContext";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const handleEditClick = () => {
    router.push('/profile/edit');
  };

  if (user === null) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div >
      {/* Banner Section */}
      <div className="relative w-full aspect-[4/1] bg-gray-300">
        <Image
          src={`data:${user.banner_file?.mime_type};base64,${user.banner_file?.base64}`}
          fill
          alt="./banner.png"
          className="object-cover"
        />
        <div className="absolute -bottom-12 left-0 w-full px-8 flex items-center justify-between">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src={`data:${user.icon_file?.mime_type};base64,${user.icon_file?.base64}`}/>
            <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <Button
            onClick={handleEditClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit Profile
          </Button>
          
        </div>
      </div>
      <div className="max-h-[80vh] max-w-[90vw]">
        {/* Profile Info Section */}
        <InfoCard user={user} />
        {/* TimeTable Session */}
        <TimeTable user={user} />
      </div>
    </div>
  );
}
