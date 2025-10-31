import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis } from "lucide-react"
import { Input } from "@/components/ui/input"
import { InviteLink } from "./invite_link"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useMemo } from "react";

export default function ServerOptions({ open, onOpenChange, otherUser, server, user }) {

    const [query, setQuery] = useState("")
    const [allServers, setAllServers] = useState([])
    const [unviteDialougeOpen, setInviteDialougeOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState("")

    // Fetch all servers on component mount
    useEffect(() => {
        const fetchServers = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/v1/servers", {
            credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
            setAllServers(data.servers);
            console.log("Fetched servers:", data.servers); // Testing purpose
            }
        } catch (error) {
            console.error("Error fetching servers:", error);
        }
        };
        if (user) fetchServers();
    }, [user]);

    // const handleInviteClick = async () => {
    //     try {
    //         const res = await fetch(`http://localhost:3001/api/v1/servers/${server._id}/invite`, {
    //             credentials: "include",
    //         });
    //         const data = await res.json();
    //         if (data.status === "success") {
    //             setInviteLink(data.inviteLink);
    //             setInviteDialougeOpen(true);
    //         }
    //     } catch (error) {
    //         console.error("Error generating invite link:", error);
    //     }
    // };

    const handleInviteClick = async () => {
        // Fake delay (optional, just to mimic loading)
        await new Promise((resolve) => setTimeout(resolve, 300));

        setInviteLink("https://example.com/invite/dummy-123");
        setInviteDialougeOpen(true);
    };

    // Only search when executedQuery changes
    const results = useMemo(() => {
        console.log(otherUser);
        if (!query.trim()) return otherUser;
        return otherUser.filter((member) =>
            member.user.username.toLowerCase().includes(query.toLowerCase()) ||
            member.user.display_name.toLowerCase().includes(query.toLowerCase())
        )
    }, [query, otherUser])

    const currentMember = useMemo(() => {
        return otherUser?.find(m => m.user?._id === user?._id);
    }, [otherUser, user]);

    const isOwner = currentMember?.role === 'owner';
    const isAdmin = currentMember?.role === 'admin';
    const isOwnerOrAdmin = isOwner || isAdmin;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Server Options</DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <Tabs className="w-full" defaultValue="options" >

                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="options" className="data-[state=active]:text-white data-[state=active]:bg-gray-900 hover:bg-gray-200">
                            Options
                        </TabsTrigger>
                        <TabsTrigger value="Rooms" className="data-[state=active]:text-white data-[state=active]:bg-gray-900 hover:bg-gray-200">
                            Rooms
                        </TabsTrigger>
                        <TabsTrigger value="members" className="data-[state=active]:text-white data-[state=active]:bg-gray-900 hover:bg-gray-200">
                            Members
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="options" className="mt-4">
                        <div className="space-y-4">
                            
                            <div className="space-y-4">
                                {/* Server Profile with Server Name Justify Middle*/}
                                <div className="flex flex-col items-center space-y-2">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={server?.icon_file ? `/api/v1/files/${server.icon_file._id}` : undefined} />
                                        <AvatarFallback>{server?.server_name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-lg font-medium">{server?.server_name}</h2>
                                </div>
                                
                                {/* Change Server Profile Button */}
                                {isOwnerOrAdmin && (
                                    <Button variant="outline" className="w-full">
                                        Change Server Profile
                                    </Button>
                                )}
                                {/* Change Server Name Button */}
                                {isOwnerOrAdmin && (
                                <Button variant="outline" className="w-full">
                                    Change Server Name
                                </Button>
                                )}
                                {/* Invite Button */}
                                <Button variant="outline" className="w-full" onClick={handleInviteClick}>
                                    Invite Members
                                </Button>
                                {/* Delete Server Button */}
                                {isOwner && (
                                <Button variant="destructive" className="w-full">
                                    Delete Server
                                </Button>
                                )}
                                {/* Leave Server Button */}
                                <Button variant="destructive" className="w-full">
                                    Leave Server
                                </Button>

                            </div>
                        </div>
                    </TabsContent> 
                    <TabsContent value="Rooms" className="mt-4">
                        <div className="space-y-4">
                            {/* Add room button */}
                            {isOwnerOrAdmin && (
                                <Button variant="outline" className="w-full mb-4" onClick={() => console.log("Add Room")}>
                                    Add Room
                                </Button>
                            )}
                            {/* Rooms List */}
                            {/* list all rooms of server where server is in allServers */}
                            {allServers.find(s => s._id === server._id) ? (
                                <div className="text-sm text-gray-500 space-y-2">
                                    {allServers.find(s => s._id === server._id).rooms.map((room) => (
                                        <div key={room._id} className="p-2 border-b border-gray-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{room.title}</p>
                                                <p className="text-sm text-gray-500">Type: {room.room_type}</p>
                                            </div>
                                            {/* Room Options */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-gray-500 hover:text-gray-700 p-2">
                                                        <Ellipsis className="h-5 w-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-40">
                                                <DropdownMenuLabel>{room.title}</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => console.log("???:", room.title)}>
                                                    ???
                                                </DropdownMenuItem>

                                                {/* Only owners/admins/moderators can edit or delete */}
                                                {isOwnerOrAdmin && (
                                                    <>
                                                    <DropdownMenuItem onClick={() => console.log("Change room name:", room.title)}>
                                                        Change Room Name
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => console.log("Delete room:", room.title)}
                                                    >
                                                        Delete Room
                                                    </DropdownMenuItem>
                                                    </>
                                                )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No rooms available.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="members" className="mt-4">
                        <div className="space-y-4">
                            {/* Members List */}
                            <div className="text-sm text-gray-500 space-y-2">
                                {/* Search input */}
                                <div className="relative flex items-center">   
                                    <Input
                                        placeholder="Search members..."
                                        className="pr-10"
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                    <Search
                                        className="absolute right-3 h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700"
                                    />
                                </div>

                                {/* Search results can go here */}
                                <div className="mt-2 text-gray-600">
                                {results.length === 0 ? (
                                    <p className="text-sm text-gray-500">No members found.</p>
                                ) : (
                                    <div className="max-h-64 overflow-y-auto">
                                    {results.map((member) => (
                                        <div key={member._id} className="p-2 border-b border-gray-200">
                                            <div className="flex items-center justify-between w-full">
                                                
                                                {/* Left side: Avatar + name */}
                                                <div className="flex items-center space-x-3">
                                                <button 
                                                    onClick={() => console.log("Clicked avatar:", member.user.username)}
                                                    className="focus:outline-none"
                                                >
                                                    <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
                                                    <AvatarImage src={member.user.icon_file ? `/api/v1/files/${member.user.icon_file._id}` : undefined}/>
                                                    <AvatarFallback>{member.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                </button>

                                                <div>
                                                    <p className="font-medium">{member.user.username}</p>
                                                    <p className="text-sm text-gray-500">Role: {member.role || "Member"}</p>
                                                </div>
                                                </div>

                                                {/* Member Options */}
                                                <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-gray-500 hover:text-gray-700 p-2">
                                                    <Ellipsis className="h-5 w-5" />
                                                    </button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent className="w-40">
                                                <DropdownMenuLabel>{member.user.username}</DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={() => console.log("View profile:", member.user.username)}>
                                                    View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => console.log("Message:", member.user.username)}>
                                                    Message
                                                </DropdownMenuItem>

                                                {isOwnerOrAdmin && member.user._id !== user._id && (
                                                  <>
                                                    <DropdownMenuItem onClick={() => console.log("Set role:", member.user.username)}>
                                                        Set Role
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => console.log("Kick user:", member.user.username)}
                                                    >
                                                        Kick
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => console.log("Ban user:", member.user.username)}
                                                    >
                                                        Ban
                                                    </DropdownMenuItem>
                                                    </>
                                                )}
                                                </DropdownMenuContent>

                                                </DropdownMenu>

                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                )}
                                </div>

                            </div>
                        </div>
                    </TabsContent>

                </Tabs>
            </DialogContent>
            <InviteLink
                isOpen={unviteDialougeOpen}
                onClose={() => setInviteDialougeOpen(false)}
                inviteLink={inviteLink}
            />
        </Dialog>
        )
}
