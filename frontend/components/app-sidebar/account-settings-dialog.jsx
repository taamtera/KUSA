"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccountSettingsDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleMyProfileClick = () => {
    setOpen(false); // Close the dialog
    router.push('/profile');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded hover:bg-gray-200">
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-white text-black">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>Manage your account information and settings.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <button 
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
            onClick={handleMyProfileClick}
          >
            My Profile
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Change password</button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600">Sign out</button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600">Delete account</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}