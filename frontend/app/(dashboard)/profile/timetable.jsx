"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TimeTableGrid from "./timetablegrid"
import { Input } from "@/components/ui/input"
import useTimetable from "@/components/TableContent"
import { Sparkle } from "lucide-react"
import { useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import * as ToggleGroup from "@radix-ui/react-toggle-group"

export default function ProfilePage({ user }) {
    const [open, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openEditDrop, setopenEditDrop] = useState(false);
    const [openAddDrop, setopenAddDrop] = useState(false);
    const [isError, setIsError] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [day, setDay] = useState("");
    const [start_min, setStart_min] = useState("");
    const [end_min, setEnd_min] = useState("");
    const [location, setLocation] = useState("");
    const [color, setColor] = useState("");
    const [selectSlot, setSelectSlot] = useState(null);
    const colorTimerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    // edit section
    const [spanEdit, setSpanEdit] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDay, setEditDay] = useState("");
    const [editStartMin, setEditStartMin] = useState("");
    const [editEndMin, setEditEndMin] = useState("");
    const [editColor, setEditColor] = useState("");

    const { slots, loading: slotsLoading, error, reload } = useTimetable(user?._id);
    // console.log("slots from useTimetable:", slots);
    // console.log("user id in timetable page:", user?._id);

    const time_width = 150;
    const minutesPerColumn = 60; // change to 15 for finer resolution
    const DAY_TO_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const DaysList = [
        { label: "Sunday", value: "sun" },
        { label: "Monday", value: "mon" },
        { label: "Tuesday", value: "tue" },
        { label: "Wednesday", value: "wed" },
        { label: "Thursday", value: "thu" },
        { label: "Friday", value: "fri" },
        { label: "Saturday", value: "sat" },
    ];


    //Convert slots into grid placement props
    const mappedSlots = slots.map((s) => {
        const startMin = Number(s.start_min);
        const endMin = Number(s.end_min);
        const startCol = Math.floor(startMin / minutesPerColumn) + 2; // grid columns start at 2
        const spanCols = Math.max(1, Math.ceil((endMin - startMin) / minutesPerColumn));
        const row = (DAY_TO_INDEX[s.day] ?? 0) + 2; // grid rows start at 2
        return {
            id: s._id || `${s.day}-${s.start_min}-${s.end_min}`,
            title: s.title,
            description: s.description,
            location: s.location,
            color: s.color || 'purple',
            gridColumn: `${startCol} / span ${spanCols}`,
            gridRow: row,
            hourStart: Math.floor(startMin / 60),
            minStart: startMin % 60,
            hourEnd: Math.floor(endMin / 60),
            minEnd: endMin % 60,
            day: s.day
        };
    });

    function leadingTwoZero(val) {
        return val.toString().padStart(2, "0")
    };

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        // Clear any previous pending updates
        clearTimeout(colorTimerRef.current);

        // Wait 100ms before setting state
        colorTimerRef.current = setTimeout(() => {
            setColor(newColor);
        }, 100);
    };
    const handleColorChangeOnEdit = (e) => {
        const newColor = e.target.value;
        // Clear any previous pending updates
        clearTimeout(colorTimerRef.current);

        // Wait 100ms before setting state
        colorTimerRef.current = setTimeout(() => {
            setEditColor(newColor);
        }, 100);
    };

    const handleEditSlot = (slot) => {
        setSelectSlot(slot);
        setSpanEdit(true);

        setEditTitle(slot.title || "");
        setEditDescription(slot.description || "");
        setEditDay(slot.day);
        setEditStartMin(slot.hourStart);  // using hourStart from grid
        setEditEndMin(slot.hourEnd);
        setEditColor(slot.color || "");

        setOpenEdit(true); // 👈 open dialog
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        console.log("selected slot", selectSlot.id);
        if (!selectSlot) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/v1/timetable/${selectSlot.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    day: editDay,
                    start_min: (Number(editStartMin)) * 60,
                    end_min: (Number(editEndMin)) * 60,
                    color: editColor,
                }),
                credentials: "include",
            });

            const data = await response.json();
            if (response.ok) {
                window.location.href = "/profile";
            } else {
                alert(data.message || "Failed to update timetable slot");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };


    const handleSubmitAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await fetch("http://localhost:3001/api/v1/timetable",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        day,
                        start_min: (Number(start_min)) * 60,
                        end_min: (Number(end_min)) * 60,
                        location,
                        color
                    }),
                    credentials: "include"
                }
            );

            let data = await response.text();
            try {
                data = JSON.parse(data);
            } catch (jsonError) {
                data = { message: data };
            }

            if (response.ok) {
                setIsError(false);
                window.location.href = "/profile";
            } else {
                setIsError(true);
            }

        } catch (error) {
            console.error('Network or unexpected error:', error);
            alert("Something went wrong!");
            setIsError(true);
            setMessage('An unexpected network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative px-8 pb-4 h-auto w-full">

            <div className="flex flex-col mt-8 mb-4">
                <h2 className="text-xl font-semibold">
                    Timetable
                </h2>

                {/* Share Button */}
                <Button className="absolute px-4 right-10 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded w-15">share</Button>
                {/* Save Button */}
                <Button className="absolute px-4 right-30 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded w-15">save</Button>

                {/* Add Button */}
                <Dialog open={open} onOpenChange={setOpenAdd}>
                    <DialogTrigger asChild>
                        <Button className="absolute right-70 px-4 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded w-15">add</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm bg-white text-black">
                        <DialogHeader>
                            <DialogTitle>Add to Timetable</DialogTitle>
                        </DialogHeader>
                        <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmitAdd}>
                            <div>
                                <label>Class name</label>
                                <Input
                                    className="w-full border rounded p-2"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Description</label>
                                <Input className="w-full border rounded p-2"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="relative w-full max-w-sm">
                                <label>Day</label>
                                <Button
                                    className="rounded-[4px] border-2 border-gray-100 justify-between text-gray-800 hover:text-gray-800 hover:bg-gray-200 shadow-md bg-transparent w-full"
                                    onClick={() => setopenAddDrop(!openAddDrop)} // toggle dropdown
                                    type="button"
                                >
                                    {day ? (DaysList.find(d => d.value === day)?.label || "Select day") : "Select day"}
                                    <svg
                                        viewBox="0 0 16 16"
                                        fill="currentColor"
                                        aria-hidden="true"
                                        className="size-5 text-gray-400 sm:size-4"
                                    >
                                        <path
                                            d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z"
                                            clipRule="evenodd"
                                            fillRule="evenodd"
                                        />
                                    </svg>
                                </Button>

                                {openAddDrop && (
                                    <ul className="absolute text-gray-700 pt-1 shadow-md w-full rounded-[4px] bg-gray-200 z-10">
                                        {DaysList.map((d) => (
                                            <li key={d.value}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDay(d.value);
                                                        setopenAddDrop(false);
                                                    }}
                                                    className="hover:bg-gray-300 bg-gray-200 w-full text-left pt-1 px-3 pb-1 rounded-[4px] justify-between items-center flex"
                                                >
                                                    <p>{d.label}</p>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label>Time (24 Hr format)</label>
                                    <Input className="w-full border rounded p-2"
                                        placeholder="From"
                                        value={start_min}
                                        onChange={(e) => setStart_min(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="invisible">To</label>
                                    <Input className="w-full border rounded p-2"
                                        placeholder="To"
                                        value={end_min}
                                        onChange={(e) => setEnd_min(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <div>
                                    <label for="hs-color-input">Color</label> <p className="text-gray-200"></p>
                                    <input type="color"
                                        class="p-1 h-14 w-full block bg-white border border-gray-200 cursor-pointer rounded disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                                        id="hs-color-input"
                                        value={color}
                                        title="Choose your color"
                                        onChange={handleColorChange}
                                    ></input>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
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

                {/* Edit Button */}
                {/* <Button className="absolute py-3 mt-5 px-4 right-50 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">edit</Button> */}
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogTrigger asChild>
                        <Button className="absolute right-50 px-4 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded w-15">
                            edit
                        </Button>
                    </DialogTrigger>

                    <DialogContent
                        className={`${selectSlot ? "w-[720px]" : "w-[150px] h-[150px]"} max-w-[90vw] min-w-[350px] max-h-[60vh] bg-white text-black flex flex-col`}
                    >
                        <DialogHeader>
                            <DialogTitle>Edit Timetable</DialogTitle>
                        </DialogHeader>

                        {/* ✅ Single form only (no nested <form>) */}
                        <form className="flex flex-col gap-2 flex-1 min-h-0" onSubmit={handleSubmitEdit}>
                            {/* Slot selector */}
                            <label>Select Time Slot</label>
                            <div className="relative w-full">
                                <Button
                                    className="w-full rounded-[4px] h-[34px] border border-gray-200 justify-between text-left text-black hover:text-white bg-transparent"
                                    onClick={() => setopenEditDrop(!openEditDrop)}
                                    type="button"
                                >
                                    <p className="w-full overflow-hidden truncate">{selectSlot ? selectSlot.title : "Select"}</p>
                                    <svg
                                        viewBox="0 0 16 16"
                                        fill="currentColor"
                                        aria-hidden="true"
                                        className="size-5 text-gray-400 sm:size-4"
                                    >
                                        <path
                                            d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z"
                                            clipRule="evenodd"
                                            fillRule="evenodd"
                                        />
                                    </svg>
                                </Button>

                                {openEditDrop && (
                                    <ul
                                        className="absolute w-full text-gray-700 pt-1 shadow-[0_0px_15px_-3px] shadow-gray-400 border border-gray-400 rounded-[4px] bg-gray-100 z-50"
                                    >
                                        {mappedSlots.map((slot) => (
                                            <li key={slot.id}>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectSlot(slot);
                                                        setopenEditDrop(false);
                                                        setSpanEdit(true);
                                                        setEditTitle(slot.title);
                                                        setEditDescription(slot.description);
                                                        setEditDay(slot.day);
                                                        setEditStartMin(slot.startMin);
                                                        setEditEndMin(slot.endMin);
                                                        setEditColor(slot.color);
                                                    }}
                                                    className="hover:bg-gray-200 bg-gray-100 w-full text-left p-2 rounded-[4px] justify-between items-center flex"
                                                >
                                                    <p className="text-left text-[12px] text-gray-500 w-[150px] overflow-hidden truncate">{slot.title}</p>
                                                    <p className="text-right text-[12px] text-gray-500 text-sm">
                                                        {slot.day} {leadingTwoZero(slot.hourStart)}:{leadingTwoZero(slot.minStart)} - {leadingTwoZero(slot.hourEnd)}:{leadingTwoZero(slot.minEnd)}</p>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {spanEdit && (
                                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden text-[16px]">
                                    <div>
                                        <label>Class name</label>
                                        <textarea
                                            className="w-full border rounded p-2 text-[14px] h-[36px]"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>Description</label>
                                        <textarea
                                            className="w-full border rounded p-2 text-[14px] h-[56px]"
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <label>Day</label>
                                            <select
                                                className="w-full border rounded px-2 text-[14px] h-[34px]"
                                                value={editDay}
                                                onChange={(e) => setEditDay(e.target.value)}
                                            >
                                                {DaysList.map((d) => (
                                                    <option key={d.value} value={d.value}>{d.value.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label>Start (hr)</label>
                                            <Input
                                                value={editStartMin}
                                                onChange={(e) => setEditStartMin(e.target.value)}
                                                className="text-[14px] h-[34px]"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label>End (hr)</label>
                                            <Input
                                                value={editEndMin}
                                                onChange={(e) => setEditEndMin(e.target.value)}
                                                className="text-[14px] h-[34px]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label>Color</label>
                                        <input
                                            type="color"
                                            className="p-[2px] h-[48px] w-full block bg-white border border-gray-200 rounded"
                                            value={editColor}
                                            onChange={(e) => handleColorChangeOnEdit(e, setEditColor)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex justify-end content-end gap-2 pt-4">
                                {spanEdit && (
                                    <Button type="button" variant="outline" className="cursor-pointer bg-transparent" onClick={() => setOpenEdit(false)}>
                                        Cancel
                                    </Button>
                                )}
                                {spanEdit && (
                                    <Button type="submit" className="cursor-pointer">
                                        Save
                                    </Button>
                                )}
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* TimeTable Session */}
            <TimeTableGrid
                propUserId={user._id}
                onEditSlot={handleEditSlot}
            />
        </div>
    )
}
