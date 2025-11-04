import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Ellipsis } from "lucide-react";
import { useMemo } from "react";

export default function MembersTab({ otherUser, user, query, setQuery, isOwnerOrAdmin }) {

    const results = useMemo(() => {
        if (!query.trim()) return otherUser;
        return otherUser.filter((member) =>
            member.user.username.toLowerCase().includes(query.toLowerCase()) ||
            member.user.display_name.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, otherUser]);

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
                                                <DropdownMenuItem className="text-red-600">Kick</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Ban</DropdownMenuItem>
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
