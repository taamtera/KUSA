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
    const [bannerPreview, setBannerPreview] = useState(null)
    const [pfpPreview, setPfpPreview] = useState(null)
    const [selectedBannerFile, setSelectedBannerFile] = useState(null)
    const [selectedPfpFile, setSelectedPfpFile] = useState(null)
    const { user, refreshUser } = useUser()
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

    const handleFileSelected = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const previewURL = URL.createObjectURL(file)

        if (uploadType === "banner") {
            setBannerPreview(previewURL)
            setSelectedBannerFile(file)
        } else {
            setPfpPreview(previewURL)
            setSelectedPfpFile(file)
        }

        setDialogOpen(false)
    }

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        setLoading(true)
        setTimeout(() => {
            setDialogOpen(false)
        }, 1);
        try {
            // Upload banner if changed
            if (selectedBannerFile) {
                const form = new FormData()
                form.append("file", selectedBannerFile)
                form.append("id", user._id)
                form.append("type", "banner")

                await fetch("http://localhost:3001/upload", {
                    method: "POST",
                    credentials: "include",
                    body: form,
                })
            }

            // Upload pfp if changed
            if (selectedPfpFile) {
                const form = new FormData()
                form.append("file", selectedPfpFile)
                form.append("id", user._id)
                form.append("type", "pfp")

                await fetch("http://localhost:3001/upload", {
                    method: "POST",
                    credentials: "include",
                    body: form,
                })
            }

            // Save profile text fields
            await fetch("http://localhost:3001/api/v1/auth/me", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            })

            await refreshUser()
        } catch (err) {
            setError("Failed to save profile")
        } finally {
            setLoading(false)
            window.location.pathname = "/profile"
        }
    }

    const handleUploadClick = (type) => {
        setUploadType(type)
        setDialogOpen(true)
    }

    if (!user) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="w-full">
            {/* Banner Section */}
            <div className="relative w-full bg-gray-300 cursor-pointer" onClick={() => handleUploadClick("banner")}>
                <div className="relative group w-full aspect-[4/1] rounded-xl overflow-hidden">
                    {/* Banner image */}
                    <Image src={bannerPreview || `data:${user.banner_file?.mime_type};base64,${user.banner_file?.base64}`} alt="banner.png" fill sizes="100vw" className="object-cover" />

                    {/* Frosted border (optional; matches avatar effect) */}
                    <div className="absolute inset-0 rounded-xl border-[3px] border-white/40 backdrop-blur-sm pointer-events-none"></div>

                    {/* Hover overlay */}
                    <div className=" absolute inset-0 rounded-xl bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                        {/* Pencil icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16.862 3.487a1.5 1.5 0 0 1 2.121 2.121l-10.5 10.5L6 17l.891-2.483 10.5-10.5z" />
                            <path d="M19 13v6h-14v-14h6" />
                        </svg>
                    </div>
                </div>

                <div className="absolute -bottom-12 left-0 w-full px-8 flex items-center justify-between">
                    {/* Avatar */}
                    <div
                        className="cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleUploadClick("pfp")
                        }}
                    >
                        <div className="relative group w-24 h-24">
                            {/* Frosted white ring around avatar */}
                            <div className="absolute inset-0 rounded-full p-1 bg-white/30 backdrop-blur-sm pointer-events-none" />

                            {/* Avatar image */}
                            <Avatar className="w-full h-full rounded-full overflow-hidden">
                                <AvatarImage src={pfpPreview || `data:${user.icon_file?.mime_type};base64,${user.icon_file?.base64}`} alt="Avatar.png" className="object-cover" />

                                <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>

                            {/* Hover overlay */}
                            <div className=" absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer">
                                {/* Pencil Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M16.862 3.487a1.5 1.5 0 0 1 2.121 2.121l-10.5 10.5L6 17l.891-2.483 10.5-10.5z" />
                                    <path d="M19 13v6h-14v-14h6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                window.location.pathname = "/profile"
                            }}
                            variant="outline"
                        >
                            Cancel
                        </Button>

                        <Button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
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
                    <Textarea name="bio" value={profile.bio} onChange={handleChange} rows={3} />
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
                        <DialogTitle>Upload {uploadType === "pfp" ? "Profile Picture" : "Banner"}</DialogTitle>
                        <DialogDescription>Select an image to upload.</DialogDescription>
                    </DialogHeader>

                    <input type="file" accept="image/*" onChange={handleFileSelected} className="w-full border p-2 rounded" />

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
