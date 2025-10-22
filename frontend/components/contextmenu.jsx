import { Button } from "./ui/button";
import { useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";

export function ContextMenu({ visible, x, y, closeMenu, onReplyClick }) {

    const contextMenuRef = useRef(null);
    useOnClickOutside(contextMenuRef, closeMenu);

    const handleReplyClick = () => {
        if (onReplyClick) onReplyClick(); // Call the parent handler
    };

    return (
        <div
            ref={contextMenuRef}
            className="absolute bg-gray-100 rounded-[4px] shadow-lg z-50"
            style={{top: `${y}px`, left: `${x}px`}}
        >
            <Button 
                className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer"
                onClick={closeMenu} // Just close menu for edit
            >
                Edit
            </Button>
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