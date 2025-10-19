import { Button } from "./ui/button";
import { useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";

export function ContextMenu({ visible, x, y, closeMenu }) {

    const contextMenuRef = useRef(null);
    useOnClickOutside(contextMenuRef, closeMenu);

    return (
        <div
            ref={contextMenuRef}
            onClick={() => closeMenu()}
            className="absolute bg-gray-100 rounded-[4px] shadow-lg z-50"
            style={{top: `${y}px`, left: `${x}px`}}
        >
            <Button className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer">Reply</Button>
            <Button className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer">Forward</Button>
            <Button className="w-full text-left rounded-xs bg-gray-100 text-gray-900 hover:text-white p-0 cursor-pointer">Delete</Button>
        </div>
    );
}