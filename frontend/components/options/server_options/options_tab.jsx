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
// import Cropper from "react-easy-crop";

export default function OptionsTab({ server, isOwnerOrAdmin, isOwner }) {
  const router = useRouter();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameDialogOpen, setNameDialogOpen] = useState(false);

  async function getCroppedImage(imageSrc, cropPixels) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;

    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  }

  const handleUploadCroppedImage = async () => {
    const blob = await getCroppedImage(selectedImage, croppedAreaPixels);

    const formData = new FormData();
    formData.append("icon", blob, "icon.jpg");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servers/${server._id}/icon`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (res.ok) {
      setProfileDialogOpen(false);
      router.refresh(); // Refresh UI
    }
  };

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }


  async function handleChangeServerName() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/servers/${server._id}/name`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newName }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Server name updated.");
      setNameDialogOpen(false);
      router.refresh?.();
      window.location.reload();

    } catch (err) {
      console.error("Name update error:", err);
      alert("Error updating name.");
    }
  }

  async function handleLeaveServer() {
    if (!confirm("Are you sure you want to leave this server?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servers/leave`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: server._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("You left the server.");
      router.push("/chats");
      window.location.reload();

    } catch (err) {
      console.error("Leave error:", err);
      alert("An error occurred.");
    }
  }


  // Delete server
  async function handleDeleteServer() {
    if (!confirm("Are you sure? This will delete everything forever.")) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servers/${server._id}`, {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/servers/${server._id}/invite`,
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
            src={
              server?.icon_file
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/files/${server.icon_file}`
                : undefined
            }
          />
          <AvatarFallback>{server?.server_name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-medium">{server?.server_name}</h2>
      </div>

      {/* Owner/Admin Actions */}
      {isOwnerOrAdmin && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setNameDialogOpen(true)}
        >
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
      <Button variant="destructive" className="w-full" onClick={handleLeaveServer}>
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

      {/* Change server profile dialouge */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Server Icon</DialogTitle>
            <DialogDescription>Upload and crop a square image.</DialogDescription>
          </DialogHeader>

          {!selectedImage ? (
            <div className="flex flex-col items-center space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedImage(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          ) : (
            <div className="relative h-64 w-full bg-black/20">
              {/* <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedPixels) => {
                  setCroppedAreaPixels(croppedPixels);
                }}
              /> */}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              Cancel
            </Button>
            {selectedImage && (
              <Button onClick={handleUploadCroppedImage}>
                Save
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      {/* Change server name dialouge. */}
      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Server Name</DialogTitle>
            <DialogDescription>
              Enter a new name for this server.
            </DialogDescription>
          </DialogHeader>

          <input
            type="text"
            className="border p-2 w-full rounded"
            placeholder="New server name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={handleChangeServerName}>Save</Button>
            <Button variant="outline" onClick={() => setNameDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}