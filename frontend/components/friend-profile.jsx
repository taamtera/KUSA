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
import Image from 'next/image';
import pbanner from "@/components/img/pbanner.jpg";

export default function FriendProfile({ open, onOpenChange, friend }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{friend.display_name}'s Profile</DialogTitle>
        </DialogHeader>

        <Image
          src={pbanner}
          alt="Profile Banner"
          className="w-full h-full object-cover flex"
        />

        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src={friend.icon_file?.storage_key} />
              <AvatarFallback>{friend.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <Button type="Button" className="mt-4 w-full">Add Friend</Button>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            {friend.display_name && (
              <p><span>Name: </span>{friend.display_name}</p>
            )}
            {friend.bio && (
                <p><span>Bio: </span>{friend.bio}</p>
            )}
            {friend.gender && (
              <p><span>Gender: </span>{friend.gender}</p>
            )}
            {friend.faculty && (
              <p><span>Faculty: </span>{friend.faculty}</p>
            )}
            {friend.major && (
              <p><span>Major: </span>{friend.major}</p>
            )}
            {friend.email && (
              <p><span>Email: </span>{friend.email}</p>
            )}
            {friend.phone_number && (
              <p><span>Phone: </span>{friend.phone_number}</p>
            )}
          </div>

        </div>

        <DialogClose asChild>
          <Button type="button" className="absolute right-4 top-4">✕</Button>
        </DialogClose>

      </DialogContent>
    </Dialog>
  )
}
