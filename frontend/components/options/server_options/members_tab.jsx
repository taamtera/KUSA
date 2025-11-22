import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Ellipsis } from "lucide-react"
import { useMemo } from "react"
import { useEffect, useState } from "react"
import { getAvatarFallback } from "@/components/utils";

export default function MembersTab({ server, otherUser, user, query, setQuery, isOwnerOrAdmin, isOwner }) {

    const [members, setMembers] = useState(otherUser);
    const [showBannedModal, setShowBannedModal] = useState(false);
    const [bannedMembers, setBannedMembers] = useState([]);

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

    async function handleSetRole(targetUserId, newRole) {
        const res = await fetch('http://localhost:3001/api/v1/servers/set-role', {
            credentials: "include",
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId: server._id, userId: targetUserId, role: newRole })
        });
        if (res.ok) {
            setMembers(prev => prev.map(m => {
                if (m.user._id === targetUserId) {
                    return { ...m, role: newRole };
                }
                return m;
            }));
            alert(`Role updated successfully.`);
        }
    }

    async function handleKick(targetUserId) {
        if (!confirm(`Are you sure you want to kick this user?`)) return;

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
        if (!confirm(`Are you sure you want to ban this user?`)) return;
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

    async function loadBannedMembers() {
        const res = await fetch(`http://localhost:3001/api/v1/servers/banned?serverId=${server._id}`, {
            credentials: "include"
        });
        if (res.ok) {
            setBannedMembers(await res.json());
            setShowBannedModal(true);
        }
    }

    async function handleUnban(userId) {
        const res = await fetch('http://localhost:3001/api/v1/servers/unban', {
            credentials: "include",
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId: server._id, userId })
        });

        if (res.ok) {
            setBannedMembers(prev => prev.filter(u => u._id !== userId));
            alert("User unbanned.");
        }
    }

    async function handleSendFriendRequest(username) {
        try {
            const res = await fetch("http://localhost:3001/api/v1/friend/add", {
                credentials: "include",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toUsername: username })
            });

            const data = await res.json();

            if (!res.ok || data.status === "failed") {
                alert(data.message || "Failed to send friend request");
                return;
            }

            alert(data.message || "Friend request sent.");
        } catch (err) {
            console.error("Error:", err);
            alert("Something went wrong sending friend request.");
        }
    }

    return (
        
        <div className="space-y-4">
            <div className="relative flex items-center">
                <Input placeholder="Search members..." className="pr-10" onChange={(e) => setQuery(e.target.value)} />
                <Search className="absolute right-3 h-5 w-5 text-gray-500" />
            </div>

            {isOwnerOrAdmin && (
                <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={loadBannedMembers}
                >
                    View Banned Members
                </button>
            )}

            {results.length === 0 ? (
                <p className="text-sm text-gray-500">No members found.</p>
            ) : (
                <div className="max-h-64 overflow-y-auto">
                    {results.map((member) => (
                        <div key={member._id} className="p-2 border-b border-gray-200">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`data:${server.icon_file?.mime_type};base64,${server.icon_file?.base64}`} />
                                        <AvatarFallback>{getAvatarFallback(server?.server_name)}</AvatarFallback>
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
                                        <DropdownMenuItem
                                            onClick={() => handleSendFriendRequest(member.user.username)}
                                        >
                                            Send Friend Request
                                        </DropdownMenuItem>

                                        {isOwnerOrAdmin && member.user._id !== user._id && (
                                            <>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger
                                                    >Set Role</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onClick={() => handleSetRole(member.user._id, "MEMBER")}>
                                                                Member
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSetRole(member.user._id, "MODERATOR")}>
                                                                Moderator
                                                            </DropdownMenuItem>
                                                            {isOwner && (
                                                            <DropdownMenuItem onClick={() => handleSetRole(member.user._id, "OWNER")}>
                                                                Owner
                                                            </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
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

        {showBannedModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded shadow-lg w-80">
                    <h2 className="text-lg font-semibold mb-3">Banned Members</h2>

                    {bannedMembers.length === 0 ? (
                        <p className="text-sm text-gray-500">No banned users.</p>
                    ) : (
                        <div className="max-h-60 overflow-y-auto space-y-3">
                            {bannedMembers.map(user => (
                                <div key={user._id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.icon_file ? `/api/v1/files/${user.icon_file._id}` : undefined}/>
                                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>

                                        <p>{user.display_name}</p>
                                    </div>

                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => handleUnban(user._id)}
                                    >
                                        Unban
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        className="mt-4 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded"
                        onClick={() => setShowBannedModal(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        )}

        </div>
    )
}
