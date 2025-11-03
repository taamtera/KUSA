import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState, useMemo } from "react"

import OptionsTab from "./options_tab"
import RoomsTab from "./rooms_tab.jsx"
import MembersTab from "./members_tab"
import { InviteLink } from "./invite_link"

export default function ServerOptions({ open, onOpenChange, otherUser, server, user }) {
    const [query, setQuery] = useState("")
    const [allServers, setAllServers] = useState([])
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
    const [inviteLink, setInviteLink] = useState("")

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const res = await fetch("http://localhost:3001/api/v1/servers", {
                    credentials: "include",
                })
                const data = await res.json()
                if (data.status === "success") {
                    setAllServers(data.servers)
                }
            } catch (error) {
                console.error("Error fetching servers:", error)
            }
        }
        if (user) fetchServers()
    }, [user])

    const handleInviteClick = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/v1/servers/${server._id}/invite`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            })

            const text = await res.text()
            let data

            try {
                data = JSON.parse(text)
            } catch (e) {
                console.error("Invalid server response:", text)
                throw new Error("Invalid JSON")
            }

            if (data.status === "success") {
                setInviteLink(data.invite_link || data.inviteLink || "")
                setInviteDialogOpen(true)
            }
        } catch (err) {
            console.error("Invite error:", err)
        }
    }

    const currentMember = useMemo(() => {
        return otherUser?.find((m) => m.user?._id === user?._id)
    }, [otherUser, user])

    const isOwner = currentMember?.role === "owner"
    const isAdmin = currentMember?.role === "admin"
    const isOwnerOrAdmin = isOwner || isAdmin

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md h-[75vh] overflow-y-auto">
                <Tabs className="w-full" defaultValue="options">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="options">Options</TabsTrigger>
                        <TabsTrigger value="rooms">Rooms</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                    </TabsList>

                    <TabsContent value="options" className="mt-4">
                        <OptionsTab server={server} isOwnerOrAdmin={isOwnerOrAdmin} isOwner={isOwner} handleInviteClick={handleInviteClick} />
                    </TabsContent>

                    <TabsContent value="rooms" className="mt-4">
                        <RoomsTab server={server} allServers={allServers} isOwnerOrAdmin={isOwnerOrAdmin} />
                    </TabsContent>

                    <TabsContent value="members" className="mt-4">
                        <MembersTab otherUser={otherUser} user={user} query={query} setQuery={setQuery} isOwnerOrAdmin={isOwnerOrAdmin} />
                    </TabsContent>
                </Tabs>
            </DialogContent>

            <InviteLink isOpen={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} inviteLink={inviteLink} />
        </Dialog>
    )
}
