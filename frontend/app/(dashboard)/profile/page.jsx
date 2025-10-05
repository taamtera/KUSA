"use client"

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import TimeTable from "./timetable";
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
    <div className=" w-[calc(100vw-260px)]">
      {/* Banner Section */}
      <div className="relative w-full h-48 bg-gray-300">
        <Image
          src={pbanner}
          alt="Profile Banner"
          className="w-full h-full object-cover flex"
        />
        <div className="absolute -bottom-12 left-0 w-full px-8 flex items-center justify-between">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src={user.icon_file?.storage_key} />
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
      {/* ฝากแก้ 
        1. ณ ตอนนี้ป */}
      <div className="flex">
        {/* Profile Info Section */}
        <InfoCard user={user} />
        {/* TimeTable Session */}
        <TimeTable user={user} />
      </div>
    </div>
  );
}
