"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import Image from "next/image"

export default function EditProfilePage() {
    const { user, setUser } = useUser()
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [uploadType, setUploadType] = useState(null) // "pfp" | "banner"
    const router = useRouter()

    const [profile, setProfile] = useState({
        username: user?.username || "",
        faculty: user?.faculty || "",
        major: user?.major || "",
        pronouns: user?.pronouns || "",
        birthday: user?.birthday || "",
        phone: user?.phone || "",
        email: user?.email || "",
        bio: user?.bio || "",
    })

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            await fetch("http://localhost:3001/api/v1/auth/me", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            })

            setUser({ ...user, ...profile })
            router.push("/profile")
        } catch (err) {
            setError("Failed to save profile")
        } finally {
            setLoading(false)
        }
    }

    const handleUploadClick = (type) => {
        setUploadType(type)
        setDialogOpen(true)
    }

    const handleFileSelected = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)
        formData.append("id", user._id)
        formData.append("type", uploadType) 

        setLoading(true)

        try {
            const res = await fetch(`http://localhost:3001/upload`, {
                method: "POST",
                credentials: "include",
                body: formData,
            })

            const data = await res.json()

            if (data.file) {
                const newUser = {
                    ...user,
                    [uploadType === "pfp" ? "icon_file" : "banner_file"]: data.file,
                }
                setUser(newUser)
            }

            setDialogOpen(false)
        } catch (err) {
            console.error("Upload failed:", err)
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="w-full">
            {/* Banner Section */}
            <div
                className="relative w-full h-48 bg-gray-300 cursor-pointer"
                onClick={() => handleUploadClick("banner")}
            >
                <Image
                    src={`data:${user.banner_file?.mime_type};base64,${user.banner_file?.base64}`}
                    fill
                    alt="banner"
                    className="object-cover"
                />

                <div className="absolute -bottom-12 left-0 w-full px-8 flex items-center justify-between">
                    {/* Avatar */}
                    <div
                        className="cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleUploadClick("pfp")
                        }}
                    >
                        <Avatar className="w-24 h-24 border-4 border-white hover:brightness-90">
                            <AvatarImage
                                src={`data:${user.icon_file?.mime_type};base64,${user.icon_file?.base64}`}
                            />
                            <AvatarFallback>
                                {user.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.push("/profile")}
                            variant="outline"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="mt-16 px-8 max-w-2xl">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <Input name="username" value={profile.username} onChange={handleChange} />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <Textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-4">Personal Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Input name="faculty" value={profile.faculty} onChange={handleChange} placeholder="Faculty" />
                    <Input name="major" value={profile.major} onChange={handleChange} placeholder="Major" />
                    <Input name="pronouns" value={profile.pronouns} onChange={handleChange} placeholder="Pronouns" />
                    <Input type="date" name="birthday" value={profile.birthday} onChange={handleChange} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone" />
                    <Input name="email" value={profile.email} onChange={handleChange} placeholder="Email" />
                </div>
            </div>

            {/* -------------------- UPLOAD DIALOG -------------------- */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            Upload {uploadType === "pfp" ? "Profile Picture" : "Banner"}
                        </DialogTitle>
                        <DialogDescription>
                            Select an image to upload.
                        </DialogDescription>
                    </DialogHeader>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelected}
                        className="w-full border p-2 rounded"
                    />

                    <DialogClose asChild>
                        <Button variant="outline" className="mt-4 w-full">
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </div>
    )
}
