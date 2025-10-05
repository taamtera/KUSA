"use client"

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Settings } from "lucide-react";
import Calendar from "./calendar";
import pbanner from "@/components/img/pbanner.jpg";
import InfoCard from "./infoCard";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
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
        <Image
          src={pbanner}
          alt="Profile Banner"
          className="w-full h-full object-cover flex"
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
        <Button 
        className="absolute py-3 mt-5 px-4 right-10 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded"
        >
          share
        </Button>
        <Button 
        className="absolute py-3 mt-5 px-4 right-30 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded"
        >
          save
        </Button>
        <Button 
        className="absolute py-3 mt-5 px-4 right-50 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded"
        >
          edit
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="absolute py-3 mt-5 px-4 right-70 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">
              add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm bg-white text-black">
            <DialogHeader>
              <DialogTitle>Add to Timetable</DialogTitle>
            </DialogHeader>
            <form className="w-full max-w-sm space-y-4">
              <div>
                <label>Class name</label>
                <input className="w-full border rounded p-2" />
              </div>
              <div>
                <label>Description</label>
                <input className="w-full border rounded p-2" />
              </div>
              <div>
                <label>Day</label>
                <input className="w-full border rounded p-2" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label>Time</label>
                  <input className="w-full border rounded p-2" placeholder="From" />
                </div>
                <div className="flex-1">
                  <label className="invisible">To</label>
                  <input className="w-full border rounded p-2" placeholder="To" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="cursor-pointer bg-transparent"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* ฝากแก้ 
        1. ณ ตอนนี้ป */}
      <div className="flex flex-1 max-h-[80vh]">
        {/* Profile Info Section */}
        <InfoCard user={user} />
        {/* Calendar Session */}
        <Calendar />
      </div>
    </div>
  );
}
