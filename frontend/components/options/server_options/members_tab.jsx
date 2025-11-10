import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Ellipsis } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

export default function MembersTab({ server, otherUser, user, query, setQuery, isOwnerOrAdmin }) {

    const [members, setMembers] = useState(otherUser);

    useEffect(() => {
        setMembers(otherUser);
    }, [otherUser]);

    const results = useMemo(() => {
        if (!query.trim()) return members;
        return members.filter((member) =>
            member.user.username.toLowerCase().includes(query.toLowerCase()) ||
            member.user.display_name.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, members]);

    async function handleKick(targetUserId) {
        const res = await fetch('http://localhost:3001/api/v1/servers/kick', {
            credentials: "include",
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId: server._id, userId: targetUserId })
        });
        if (res.ok) {
            const kickedMember = otherUser.find(m => m.user._id === targetUserId);
            setMembers(prev => prev.filter(m => m.user._id !== targetUserId));
            alert(`${kickedMember.user.display_name} has been kicked.`);
        }
    }

    async function handleBan(targetUserId) {
        const res = await fetch('http://localhost:3001/api/v1/servers/ban', {
            credentials: "include",
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId: server._id, userId: targetUserId })
        });
        if (res.ok) {
            const bannedMember = otherUser.find(m => m.user._id === targetUserId);
            setMembers(prev => prev.filter(m => m.user._id !== targetUserId));
            alert(`${bannedMember.user.display_name} has been banned.`);
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative flex items-center">
                <Input
                    placeholder="Search members..."
                    className="pr-10"
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Search className="absolute right-3 h-5 w-5 text-gray-500" />
            </div>

            {results.length === 0 ? (
                <p className="text-sm text-gray-500">No members found.</p>
            ) : (
                <div className="max-h-64 overflow-y-auto">
                    {results.map((member) => (
                        <div key={member._id} className="p-2 border-b border-gray-200">
                            <div className="flex items-center justify-between w-full">

                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.user.icon_file ? `/api/v1/files/${member.user.icon_file._id}` : undefined}/>
                                        <AvatarFallback>{member.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <p className="font-medium">{member.user.username}</p>
                                        <p className="text-sm text-gray-500">Role: {member.role || "Member"}</p>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="text-gray-500 hover:text-gray-700 p-2">
                                            <Ellipsis className="h-5 w-5" />
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="w-40">
                                        <DropdownMenuLabel>{member.user.username}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                                        <DropdownMenuItem>Message</DropdownMenuItem>

                                        {isOwnerOrAdmin && member.user._id !== user._id && (
                                            <>
                                                <DropdownMenuItem>Set Role</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleKick(member.user._id)}
                                                >
                                                    Kick
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleBan(member.user._id)}
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
    )
}
