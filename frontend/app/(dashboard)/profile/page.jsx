"use client"

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Calendar from "./calendar";
import InfoCard from "./infoCard";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/v1/auth/me", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.message || `HTTP ${res.status}`);
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user);
        setError(null);
      } catch (err) {
        setError("Network error");
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const handleEditClick = () => {
    router.push('/profile/edit');
  };

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className=" w-[calc(100vw-260px)]">
      {/* Banner Section */}
      <div className="relative w-full h-48 bg-gray-300">
        <img
          src="/images/profile-banner.jpg"
          alt="Profile Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute -bottom-12 left-0 w-full px-8 flex items-center justify-between">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src={user.icon_url || "https://github.com/shadcn.png"} />
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



      <div className="flex max-h-[90vh]">
        {/* Profile Info Section */}
        <InfoCard user={user} />
        {/* Calendar Session */}
        <Calendar />
      </div>
    </div>
  );
}
