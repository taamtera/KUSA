"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TimeTableGrid from "./timetablegrid"
import { Input } from "@/components/ui/input"
import useTimetable from "@/components/TableContent"
import { Sparkle } from "lucide-react"
import { useRef } from "react"

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
            startMin: s.start_min / 60 - 1,
            endMin: s.end_min / 60 - 1,
            day: s.day
        };
    });

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        // Clear any previous pending updates
        clearTimeout(colorTimerRef.current);

        // Wait 100ms before setting state
        colorTimerRef.current = setTimeout(() => {
            setColor(newColor);
        }, 100);
    };

    // if (!user?._id) return <div>`{user?._id}`</div>;

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
                        start_min: (Number(start_min) + 1) * 60,
                        end_min: (Number(end_min) + 1) * 60,
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
        <div className="">
            <Button className="absolute py-3 mt-5 px-4 right-10 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">share</Button>
            <Button className="absolute py-3 mt-5 px-4 right-30 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">save</Button>
            {/* <Button className="absolute py-3 mt-5 px-4 right-50 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">edit</Button> */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogTrigger asChild>
                    <Button className="absolute py-3 mt-5 px-4 right-50 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">edit</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm bg-white text-black">
                    <DialogHeader>
                        <DialogTitle>Edit Timetable</DialogTitle>
                    </DialogHeader>
                    <form className="w-full max-w-sm space-y-4">
                        <div>
                            <label>Select Time Slot</label>
                            <div className="grid place-items-center">
                                <div className="relative w-full max-w-sm">
                                    <Button
                                        className="rounded-[4px] border-2 border-gray-500 justify-between text-black hover:text-white shadow-md bg-transparent w-full"
                                        onClick={() => setopenEditDrop(!openEditDrop)} // toggle dropdown
                                        type="button"
                                    >
                                        {selectSlot ? selectSlot.title : "Select"}
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
                                        <ul className="absolute text-gray-700 pt-1 shadow-md w-full rounded-[4px] bg-gray-200 z-10">
                                            {mappedSlots.map((slot) => (
                                                <li key={slot.id}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectSlot(slot);
                                                            setopenEditDrop(false);
                                                            // console.log("Clicked", slot.title);
                                                        }}
                                                        className="hover:bg-gray-300 bg-gray-200 w-full text-left p-2 rounded-[4px] justify-between items-center flex"
                                                    >
                                                        <p className="text-left">{slot.title}</p>
                                                        <p className="text-right text-gray-400 text-sm">{slot.day} {slot.startMin} - {slot.endMin}</p>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" className="cursor-pointer bg-transparent" onClick={() => setOpenEdit(false)}>
                                Cancel
                            </Button>
                            {/* <Button type="submit" className="cursor-pointer">
                                Save
                            </Button> */}
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* TimeTable Session */}
            <Dialog open={open} onOpenChange={setOpenAdd}>
                <DialogTrigger asChild>
                    <Button className="absolute py-3 mt-5 px-4 right-70 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">add</Button>
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
                                className="rounded-[4px] border-2 border-gray-100 justify-between text-gray-800 hover:text-white shadow-md bg-transparent w-full"
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
                                <label>Time</label>
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
                                    class="p-1 h-14 w-full block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
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
            {/* TimeTable Session */}
            <TimeTableGrid propUserId={user._id} />
        </div>
    )
}
