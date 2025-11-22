import { Button } from "./ui/button";
import { useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";

export function ContextMenu({ x, y, closeMenu, onReplyClick, onEditClick, onUnsendClick, currentUser, content }) {
    // const { user } = useUser();
    const contextMenuRef = useRef(null);
    useOnClickOutside(contextMenuRef, closeMenu);

    // console.log("user: ", user);
    // console.log("author: ", messageAuthor);
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content);
            closeMenu();
        } catch (err) {
            console.error(err);
            closeMenu();
        }
    };

    return (
        <div
            ref={contextMenuRef}
            className="absolute bg-gray-100 rounded-[4px] shadow-lg z-50"
            style={{ top: `${y}px`, left: `${x}px` }}
        >
            <Button
                className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer"
                onClick={copyToClipboard} // Copy
            >
                Copy
            </Button>
            {currentUser && ( // now this limitation isn't include the server(room) owner/admin to editing member messages
                <Button
                    className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer"
                    onClick={onEditClick} // 
                >
                    Edit
                </Button>
            )}
            <Button
                className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer"
                onClick={onReplyClick} // Use the new handler
            >
                Reply
            </Button>
            <Button
                className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer"
                onClick={closeMenu} // Just close menu for forward
            >
                Forward
            </Button>
            <Button
                className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer"
                onClick={onUnsendClick} // Just close menu for delete
            >
                Unsend
            </Button>
        </div>
    );
}