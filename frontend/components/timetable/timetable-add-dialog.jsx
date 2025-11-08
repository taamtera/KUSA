"use client";

import React, { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { minToHHMM, DaysList, MINUTES_PER_COLUMN } from "./time-utils";
import TimetableTimeInput from "./timetable-time-input";

export default function TimeTableAddDialog({
    open,
    setOpenAdd,
    title,
    setTitle,
    description,
    setDescription,
    day,
    setDay,
    start_min,
    setStart_min,
    end_min,
    setEnd_min,
    location,
    setLocation,
    color,
    handleColorChange,
    DaysList,
    handleSubmitAdd,
}) {
    return (
        <Dialog open={open} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
                <Button className="absolute right-30 px-4 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded w-15">
                    add
                </Button>
            </DialogTrigger>

            <DialogContent
                className="w-[720px] max-w-[90vw] min-w-[350px] max-h-[60vh] bg-white text-black flex flex-col"
            >
                <DialogHeader>
                    <DialogTitle>Add to Timetable</DialogTitle>
                </DialogHeader>

                <form className="flex flex-col gap-2 flex-1 min-h-0" onSubmit={handleSubmitAdd}>
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden text-[16px]">
                        {/* Title */}
                        <div>
                            <label>Title</label>
                            <textarea
                                className="w-full border rounded p-2 text-[14px] h-[36px]"
                                value={title}
                                maxLength={120}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <p className={`text-[12px] flex justify-end ${title.length === 120 ? "text-red-500" : ""}`}>{title.length}/120</p>
                        </div>

                        {/* Day + Start/End */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                                {/* Day */}
                                <div className="flex-2">
                                    <label className="block">Day</label>

                                    <ToggleGroup
                                        type="single"
                                        value={day || undefined}               // allow "no selection" when empty
                                        onValueChange={(value) => {
                                            if (value) setDay(value);            // ignore clearing clicks
                                        }}
                                        className="flex flex-wrap gap-1 p-2"
                                    >
                                        {DaysList.map((d) => (
                                            <ToggleGroupItem
                                                key={d.value}
                                                value={d.value}
                                                className="
                                                    w-[56px]
                                                    text-xs md:text-sm
                                                    rounded-[999px]
                                                    border border-gray-300
                                                    bg-white
                                                    text-gray-700
                                                    hover:bg-gray-100
                                                    data-[state=on]:bg-gray-600
                                                    data-[state=on]:text-white
                                                    data-[state=on]:border-gray-600
                                                "
                                            >
                                                {d.value.toUpperCase()}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="">
                                        <TimetableTimeInput
                                            label="Start"
                                            minutes={Number(start_min) || 0}
                                            onChange={setStart_min}
                                            maxHour={23}               // start cannot be 24
                                        />
                                    </div>
                                    <div>
                                        <TimetableTimeInput
                                            label="End"
                                            minutes={Number(end_min) || 0}
                                            onChange={setEnd_min}
                                            maxHour={24}               // can go up to 24:00
                                            forbidExactMidnight={true} // end cannot be 00:00
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label>Description</label>
                            <textarea
                                className="w-full border rounded p-2 text-[14px] h-[56px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label>Location</label>
                            <textarea
                                className="w-full border rounded p-2 text-[14px] h-[34px]"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        {/* Color */}
                        <div>
                            <label>Color</label>
                            <input
                                type="color"
                                className="p-[2px] h-[48px] w-full block bg-white border border-gray-200 rounded"
                                value={color}
                                onChange={handleColorChange}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end content-end gap-2 pt-4">
                        <Button type="button" variant="outline" className="cursor-pointer bg-transparent" onClick={() => setOpenAdd(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="cursor-pointer">
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
