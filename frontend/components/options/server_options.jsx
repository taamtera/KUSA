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
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useMemo, use } from "react";

export default function ServerOptions({ open, onOpenChange, otherUser, server, user }) {

    const [query, setQuery] = useState("")

    // Only search when executedQuery changes
    const results = useMemo(() => {
        console.log(otherUser);
        if (!query.trim()) return otherUser;
        return otherUser.filter((member) =>
            member.user.username.toLowerCase().includes(query.toLowerCase()) ||
            member.user.display_name.toLowerCase().includes(query.toLowerCase())
        )
    }, [query, otherUser])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Server Options</DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <Tabs className="w-full" defaultValue="options" >

                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="options" className="data-[state=active]:text-white data-[state=active]:bg-gray-900 hover:bg-gray-200">
                            Options
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
                                {otherUser.find(member => member.user._id === user._id && member.role === 'owner' || member.role === 'admin') && (
                                    <Button variant="outline" className="w-full">
                                        Change Server Profile
                                    </Button>
                                )}
                                {/* Change Server Name Button */}
                                {otherUser.find(member => member.user._id === user._id && member.role === 'owner' || member.role === 'admin') && (
                                <Button variant="outline" className="w-full">
                                    Change Server Name
                                </Button>
                                )}
                                {/* Invite Button */}
                                <Button variant="outline" className="w-full">
                                    Invite Members
                                </Button>
                                {/* Delete Server Button */}
                                {otherUser.find(member => member.user._id === user._id && member.role === 'owner') && (
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

                                                {otherUser.find(m => member.user._id !== m.user._id && m.user._id === user._id && (m.role === 'owner' || m.role === 'admin')) && (
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
        </Dialog>
        )
}
