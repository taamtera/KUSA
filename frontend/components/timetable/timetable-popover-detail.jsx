"use client"
import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil2Icon, TrashIcon, Cross2Icon, TextAlignLeftIcon } from "@radix-ui/react-icons";
import { X, MapPin, AlignLeft, PencilIcon } from "lucide-react";
import { pad2, formatLongDay } from "./time-utils";

export default function TimeTablePopoverDetail({
    title,
    fromViewProfile,
    description,
    location,
    slotColor,
    day,
    hourStart,
    minStart,
    hourEnd,
    minEnd,
    slotId,
    onEdit,
}) {

    const [deleteSlot, setDeleteSlot] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    
    const hasLocation = location != null;
    const hasDescription = description != null;

    const hour_start = pad2(hourStart % 24);
    const min_start = pad2(minStart);
    const hour_end = pad2(hourEnd % 24);
    const min_end = pad2(minEnd);

    const CapitalizedDay = formatLongDay(day);


    const DAY_PREFIXES = {
        mon: "mon",
        tue: "tues",
        wed: "wednes",
        thu: "thurs",
        fri: "fri",
        sat: "satur",
        sun: "sun",
    };

    const handleDelete = async () => {
        if (!slotId) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/timetable/${slotId}`, {
                method: "DELETE",
                credentials: "include",
            });

            let data = {};
            try {
                data = await res.json();
            } catch (_) {
                data = {};
            }

            if (res.ok) {
                // simple: reload profile to refresh timetable
                window.location.href = "/profile";
            } else {
                alert(data.message || "Failed to delete slot");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong while deleting");
        }
    };

    return (
        <div className="relative w-full">

            {/* Button session */}
            <div className="flex justify-end items-center gap-4 pb-2">
                <div className="flex gap-2">

                    {!fromViewProfile && (<button 
                        onClick={onEdit}
                        className="flex justify-center items-center cursor-pointer text-gray-500 hover:bg-gray-100 hover:rounded-full size-[30px]"
                    >
                    <PencilIcon className="size-[16px]"/>
                    </button>)}

                    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                        {!fromViewProfile && (<DialogTrigger className="flex justify-center items-center cursor-pointer text-gray-500 hover:bg-gray-100 hover:rounded-full size-[30px]">
                            <TrashIcon className="size-[18px]"/>
                        </DialogTrigger>)}
                        <DialogContent className="w-[256px]">
                            <DialogHeader>
                                <DialogTitle>Delete Time Slot</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-between items-center pt-4">
                                <Button type="button" variant="outline" className="cursor-pointer bg-transparent" onClick={() => setOpenDelete(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleDelete} type="submit" className="cursor-pointer bg-red-500 border border-red-500 hover:bg-transparent hover:text-red-500 hover:border hover:border-red-500">
                                    Delete
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <PopoverClose className="p-2 cursor-pointer text-gray-500 hover:bg-gray-300/30 rounded-full">
                    <X className="size-[20px]" />
                </PopoverClose>
            </div>

            {/* Information session */}
            <div className="flex flex-col mt-[3px] px-2 overflow-y-auto max-h-[40vh]">
                <div className="flex gap-2">
                    <div className="min-w-[12px]  rounded-[8px]"
                        style={{ backgroundColor: slotColor }}
                    >
                    </div>
                    <div className="max-w-[450px] 
                    text-xl font-medium text-gray-500 dark:text-fuchsia-100
                    wrap-anywhere whitespace-pre-wrap"
                    >
                        {title}
                    </div>
                </div>
                <hr className="my-[4px]"></hr>
                <h2 className="text-xm font-medium text-gray-500 dark:text-fuchsia-100">
                    {CapitalizedDay} {hour_start}:{min_start} - {hour_end}:{min_end}
                </h2>
                {hasLocation && (
                    <div className="py-2 flex items-start gap-2">
                        <div>
                            <MapPin className="text-gray-500 size-[15px]" />
                        </div>
                        <p className="p-1 w-full 
                        bg-gray-200/20 rounded-[8px] border border-gray-200/50 
                        text-xs font-medium text-gray-500 dark:text-fuchsia-100
                        wrap-anywhere whitespace-pre-wrap"
                        >
                            {location}
                        </p>
                    </div>
                )}
                {hasDescription && (
                    <div className="py-2 flex items-start gap-2">
                        <h3>
                            <AlignLeft className="text-gray-500 size-[15px]" />
                        </h3>
                        <p className="p-1 w-full
                        bg-gray-200/20 rounded-[8px] border border-gray-200/50 
                        text-xs font-medium text-gray-500 dark:text-fuchsia-100
                        wrap-anywhere whitespace-pre-wrap"
                        >
                            {description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}