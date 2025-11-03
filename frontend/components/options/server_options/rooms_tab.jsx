import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";

export default function RoomsTab({ server, allServers, isOwnerOrAdmin }) {

    const foundServer = allServers.find(s => s._id === server._id);

    return (
        <div className="space-y-4">

            {isOwnerOrAdmin && (
                <Button variant="outline" className="w-full mb-4">
                    Add Room
                </Button>
            )}

            {foundServer ? (
                <div className="text-sm text-gray-500 space-y-2">
                    {foundServer.rooms.map((room) => (
                        <div key={room._id} className="p-2 border-b border-gray-200 flex justify-between items-center">

                            <div>
                                <p className="font-medium">{room.title}</p>
                                <p className="text-sm text-gray-500">Type: {room.room_type}</p>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-gray-500 hover:text-gray-700 p-2">
                                        <Ellipsis className="h-5 w-5" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-40">
                                    <DropdownMenuLabel>{room.title}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem>
                                        ???
                                    </DropdownMenuItem>

                                    {isOwnerOrAdmin && (
                                        <>
                                            <DropdownMenuItem>
                                                Change Room Name
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">
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
    )
}
