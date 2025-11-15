"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUser } from "@/context/UserContext";

export default function FriendProfile() {
  const { user } = useUser();

  if (user === null) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <Dialog>
      <form>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{user.display_name}'s Profile</DialogTitle>
          </DialogHeader>
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={user.icon_file?.storage_key} />
                <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <p><span>Name: </span>{user.display_name}</p>
              <p><span>Gender: </span>{user.gender}</p>
              <p><span>Faculty: </span>{user.faculty}</p>
              <p><span>Major: </span>{user.major}</p>
              <p><span>Email: </span>{user.email}</p>
              <p><span>Phone: </span>{user.phone_number}</p>
            </div>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  )
}
