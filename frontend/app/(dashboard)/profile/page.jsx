"use client"

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "John Doe",
    username: "@johndoe",
    faculty: "Engineering",
    major: "Computer Science",
    gender: "Male",
    birthday: "2000-01-01",
    phone: "+1 234 567 890",
    email: "johndoe@example.com",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

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
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {isEditing ? "Save" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="mt-16 px-8 max-w-2xl">
        {/* Name and Username */}
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="text-2xl font-bold border-b border-gray-300 focus:outline-none w-full"
          />
        ) : (
          <h1 className="text-2xl font-bold">{profile.name}</h1>
        )}

        {isEditing ? (
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className="text-gray-500 border-b border-gray-300 focus:outline-none w-full"
          />
        ) : (
          <p className="text-gray-500">{profile.username}</p>
        )}

        {/* Bio */}
        {isEditing ? (
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            className="mt-4 text-gray-700 border border-gray-300 rounded p-2 w-full"
          />
        ) : (
          <p className="mt-4 text-gray-700">{profile.bio}</p>
        )}

        {/* Personal Info */}
        <h2 className="text-xl font-semibold mt-6 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["faculty", "major", "gender", "birthday"].map((field) => (
            <div key={field}>
              <span className="font-medium text-gray-600 capitalize">{field}:</span>{" "}
              {isEditing ? (
                <input
                  type={field === "birthday" ? "date" : "text"}
                  name={field}
                  value={profile[field]}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:outline-none w-full"
                />
              ) : (
                <span className="text-gray-800">{profile[field]}</span>
              )}
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <h2 className="text-xl font-semibold mt-6 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["phone", "email"].map((field) => (
            <div key={field}>
              <span className="font-medium text-gray-600 capitalize">{field}:</span>{" "}
              {isEditing ? (
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={profile[field]}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:outline-none w-full"
                />
              ) : (
                <span className="text-gray-800">{profile[field]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
