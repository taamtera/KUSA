import { Button } from "./ui/button";
import { useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { useUser } from "@/context/UserContext";

export function ContextMenu({ visible, x, y, closeMenu, onReplyClick, onEditClick, currentUser, content }) {
    // const { user } = useUser();
    const contextMenuRef = useRef(null);
    useOnClickOutside(contextMenuRef, closeMenu);

    const handleReplyClick = () => {
        if (onReplyClick) onReplyClick(); // Call the parent handler
    };

    const handleEditClick = () => {
        if (onEditClick) onEditClick();
    };
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
                    onClick={handleEditClick} // 
                >
                    Edit
                </Button>
            )}
            <Button
                className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer"
                onClick={handleReplyClick} // Use the new handler
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
                onClick={closeMenu} // Just close menu for delete
            >
                Delete
            </Button>
        </div>
    );
}