"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus} from "lucide-react";
import { useState } from "react";

export function AddFriendDialog() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");

  const handleSearch = () => {
    if (username.trim()) {
      // Add your search logic here
      alert(`✅Friend request sent to ${username}`);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setUsername(""); // Clear input when closing
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded hover:bg-gray-200">
          <UserPlus className="h-5 w-5 text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-white text-black">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add Friend</DialogTitle>
            <DialogClose asChild>
              <button 
                onClick={handleClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              >
              </button>
            </DialogClose>
          </div>
          <DialogDescription>
            Enter a username to search for and add as a friend.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Input
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            disabled={!username.trim()}
            className="w-full"
          >
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}