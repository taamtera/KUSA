import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function OptionsTab({ server, isOwnerOrAdmin, isOwner, handleInviteClick }) {
    return (
        <div className="space-y-4">

            <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={server?.icon_file ? `/api/v1/files/${server.icon_file._id}` : undefined} />
                    <AvatarFallback>{server?.server_name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-medium">{server?.server_name}</h2>
            </div>

            {isOwnerOrAdmin && (
                <Button variant="outline" className="w-full">
                    Change Server Profile
                </Button>
            )}

            {isOwnerOrAdmin && (
                <Button variant="outline" className="w-full">
                    Change Server Name
                </Button>
            )}

            <Button variant="outline" className="w-full" onClick={handleInviteClick}>
                Invite Members
            </Button>

            {isOwner && (
                <Button variant="destructive" className="w-full">
                    Delete Server
                </Button>
            )}

            <Button variant="destructive" className="w-full">
                Leave Server
            </Button>

        </div>
    )
}
