"use client"

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    faculty: "",
    major: "",
    gender: "",
    birthday: "",
    phone: "",
    email: "",
    description: "",
  });

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
        setProfile({
          name: data.user.name || "",
          username: data.user.username || "",
          faculty: data.user.faculty || "",
          major: data.user.major || "",
          gender: data.user.gender || "",
          birthday: data.user.birthday || "",
          phone: data.user.phone || "",
          email: data.user.email || "",
          description: data.user.description || ""
        });
        setError(null);
      } catch (err) {
        setError("Network error");
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Add your API call to save profile here
      // const res = await fetch("http://localhost:3001/api/v1/auth/profile", {
      //   method: "PUT",
      //   credentials: "include",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(profile)
      // });
      
      console.log("Saving profile:", profile);
      
      // Navigate back to profile page after saving
      router.push('/profile');
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
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
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="px-4 py-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="mt-16 px-8 max-w-2xl">
        {/* Name and Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <Input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Enter your display name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <Input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            name="description"
            value={profile.description}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        {/* Personal Info */}
        <h2 className="text-xl font-semibold mt-6 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
            <Input
              type="text"
              name="faculty"
              value={profile.faculty}
              onChange={handleChange}
              placeholder="Enter your faculty"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
            <Input
              type="text"
              name="major"
              value={profile.major}
              onChange={handleChange}
              placeholder="Enter your major"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <Input
              type="text"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              placeholder="Enter your gender"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
            <Input
              type="date"
              name="birthday"
              value={profile.birthday}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Contact Info */}
        <h2 className="text-xl font-semibold mt-6 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
        </div>
      </div>
    </div>
  );
}