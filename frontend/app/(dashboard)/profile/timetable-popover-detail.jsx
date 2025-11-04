"use client"
import React from "react";
import { useState, useEffect } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as Tabs from "@radix-ui/react-tabs";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import { Pencil2Icon, TrashIcon, Cross2Icon, TextAlignLeftIcon } from "@radix-ui/react-icons";
import { X, MapPin, AlignLeft, PencilIcon } from "lucide-react";

export default function TimeTablePopoverDetail({ title, description, location, slotColor, day, hourStart, minStart, hourEnd, minEnd, }) {

    const hasLocation = location != null;
    const hasDescription = description != null;

    // convert to 12-hour clock
    const isStartAM = hourStart - 1 < 12;
    const isEndAM = hourEnd - 1 < 12;

    const hour_start = (hourStart - 1 === 0 ? 12 : hourStart - 1);
    const min_start = minStart.toString().padStart(2, '0');
    const hour_end = (hourEnd - 1 === 0 ? 12 : hourEnd - 1);
    const min_end = minEnd.toString().padStart(2, '0');

    const DAY_PREFIXES = {
        mon: "mon",
        tue: "tues",
        wed: "wednes",
        thu: "thurs",
        fri: "fri",
        sat: "satur",
        sun: "sun",
    };

    const actualDay = DAY_PREFIXES[day] ?? day;
    const CapitalizedDay =
        actualDay.charAt(0).toUpperCase()
        + actualDay.slice(1)
        + "day";

    return (
        <div className="relative w-full">
            <div className="flex justify-end items-center gap-4 pb-2">
                <div className="flex gap-2">
                    <PencilIcon className="p-[6px] cursor-pointer text-gray-500 hover:bg-gray-300/30 rounded-full size-[30px]"></PencilIcon>
                    <TrashIcon className="p-[6px] cursor-pointer text-gray-500 hover:bg-gray-300/30 rounded-full size-[30px]"></TrashIcon>
                </div>
                <PopoverClose className="">
                    <X
                        className="p-2 cursor-pointer text-gray-500 hover:bg-gray-300/30 rounded-full size-[35px]"
                    >
                    </X>
                </PopoverClose>
            </div>

            <div className="flex flex-col mt-[3px] px-2 overflow-auto max-h-[40vh]">
                <div className="flex gap-2">
                    <div className="w-[12px] rounded-[8px]"
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
                    {CapitalizedDay} {hour_start}:{min_start} {isStartAM ? "am" : "pm"} - {hour_end}:{min_end} {isEndAM ? "am" : "pm"}
                </h2>
                {hasLocation && (
                    <div className="py-2 flex items-center gap-2">
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


            {/* <Tabs.Root className="">
                <Tabs.List className="flex justify-end items-center gap-4">
                    <Tabs.Trigger
                        value="edit"
                        className="pl-[4px] cursor-pointer hover:bg-gray-300/30 rounded-full size-[30px]"
                    >
                        <Pencil2Icon className="size-[20px] text-gray-500"></Pencil2Icon>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="delete"
                        className="pl-[5px] cursor-pointer hover:bg-gray-300/30 rounded-full size-[30px]"
                    >
                        <TrashIcon className="size-[20px] text-gray-500"></TrashIcon>
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="edit" >555</Tabs.Content>
            </Tabs.Root> */}
        </div>
    );
}