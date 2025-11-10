import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function OptionsTab({ server, isOwnerOrAdmin, isOwner }) {
  const router = useRouter();
  const [inviteLink, setInviteLink] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Delete server
  async function handleDeleteServer() {
    if (!confirm("Are you sure? This will delete everything forever.")) return;

    const res = await fetch(`http://localhost:3001/api/v1/servers/${server._id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      alert("Server deleted");
      router.push("/chats");
      window.location.reload();
    } else {
      alert(data.message);
    }
  }

  // Fetch invite link
  const handleInviteClick = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/v1/servers/${server._id}/invite`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid server response:", text);
        throw new Error("Invalid JSON");
      }

      if (data.status === "success") {
        setInviteLink(data.invite_link || data.inviteLink || "");
        setInviteDialogOpen(true);
      }
    } catch (err) {
      console.error("Invite error:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Server Avatar */}
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={server?.icon_file ? `/api/v1/files/${server.icon_file._id}` : undefined}
          />
          <AvatarFallback>{server?.server_name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-medium">{server?.server_name}</h2>
      </div>

      {/* Owner/Admin Actions */}
      {isOwnerOrAdmin && (
        <Button variant="outline" className="w-full">
          Change Server Profile
        </Button>
      )}

      {isOwnerOrAdmin && (
        <Button variant="outline" className="w-full">
          Change Server Name
        </Button>
      )}

      {/* Invite Members */}
      <Button variant="outline" className="w-full" onClick={handleInviteClick}>
        Invite Members
      </Button>

      {/* Delete Server */}
      {isOwner && (
        <Button variant="destructive" className="w-full" onClick={handleDeleteServer}>
          Delete Server
        </Button>
      )}

      {/* Leave Server */}
      <Button variant="destructive" className="w-full">
        Leave Server
      </Button>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Link</DialogTitle>
            <DialogDescription>
                Share this link to invite others to the server:
                <div className="mt-2 p-2 bg-gray-100 rounded break-all">{inviteLink}</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {navigator.clipboard.writeText(inviteLink); alert("Invite link copied to clipboard!");}}>
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
