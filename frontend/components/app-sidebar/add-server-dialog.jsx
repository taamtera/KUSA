"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListPlus } from "lucide-react";
import { useState } from "react";

export function AddServerDialog() {
  const [open, setOpen] = useState(false);
  const [serverName, setServerName] = useState("");
    const handleCreate = () => {
    if (serverName.trim()) {
      // Add your server creation logic here
      alert(`✅Server "${serverName}" created!`);
    }
    };
    const handleClose = () => {
    setOpen(false);
    setServerName(""); // Clear input when closing
    }
    return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded hover:bg-gray-200">
            <ListPlus className="h-5 w-5 text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-white text-black">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create Server</DialogTitle>
            <DialogClose asChild>
              <button 
                onClick={handleClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              >
                </button>
            </DialogClose>
          </div>
          <DialogDescription>
            Enter a name for your new server.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Input
            placeholder="Enter server name..."
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button
            onClick={handleCreate}
            disabled={!serverName.trim()}
            className="w-full"
            >
            Create
            </Button>
        </div>
        </DialogContent>
    </Dialog>
    );
}