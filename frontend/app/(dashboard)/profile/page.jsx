"use client"

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
    <div className="w-full">
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

      {/* Profile Info Section */}
      <div className="mt-16 px-8 max-w-2xl">
        {/* Name and Username */}
        <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
        <p className="text-gray-500">@{user.username}</p>

        {/* Description */}
        <p className="mt-4 text-gray-700">{user.description || "No description available."}</p>

        {/* Personal Info */}
        <h2 className="text-xl font-semibold mt-6 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-600">Faculty:</span>{" "}
            <span className="text-gray-800">{user.faculty || "Not specified"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Major:</span>{" "}
            <span className="text-gray-800">{user.major || "Not specified"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Gender:</span>{" "}
            <span className="text-gray-800">{user.gender || "Not specified"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Birthday:</span>{" "}
            <span className="text-gray-800">{user.birthday || "Not specified"}</span>
          </div>
        </div>

        {/* Contact Info */}
        <h2 className="text-xl font-semibold mt-6 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-600">Phone:</span>{" "}
            <span className="text-gray-800">{user.phone || "Not specified"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Email:</span>{" "}
            <span className="text-gray-800">{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
