"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

export default function FriendProfile({ open, onOpenChange, friend }) {
  if (!friend) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{friend.display_name}'s Profile</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src={friend.icon_file?.storage_key} />
              <AvatarFallback>{friend.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <p><span>Name: </span>{friend.display_name}</p>
            <p><span>Gender: </span>{friend.gender}</p>
            <p><span>Faculty: </span>{friend.faculty}</p>
            <p><span>Major: </span>{friend.major}</p>
            <p><span>Email: </span>{friend.email}</p>
            <p><span>Phone: </span>{friend.phone_number}</p>
          </div>

        </div>

        <DialogClose asChild>
          <Button type="button" className="absolute right-4 top-4">✕</Button>
        </DialogClose>

      </DialogContent>
    </Dialog>
  )
}
