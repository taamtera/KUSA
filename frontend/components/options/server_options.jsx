import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useMemo, use } from "react";

export default function ServerOptions({ open, onOpenChange, otherUser }) {
    // console.log("ServerOptions opened for serverId:", serverId);

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
                            {/* Placeholder for additional server options */}
                            <div className="space-y-4">
                                
                                <p className="text-sm text-gray-500">Additional server options can be added here.</p>

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
                                    {(results.length === 0) ? 
                                        <p className="text-sm text-gray-500">No members found.</p>
                                     : 
                                        <div className="max-h-64 overflow-y-auto">
                                        {results.map((member) => (
                                            <div key={member._id} className="p-2 border-b border-gray-200">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.user.icon_file ? `/api/v1/files/${member.user.icon_file._id}` : undefined} />
                                                <AvatarFallback>{member.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>

                                                <div>
                                                <p className="font-medium">{member.user.username}</p>
                                                <p className="text-sm text-gray-500">Role: {member.role || "Member"}</p>
                                                </div>
                                            </div>
                                            </div>
                                        ))}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                </Tabs>
            </DialogContent>
        </Dialog>
        )
}
