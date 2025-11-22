"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import TimeTableAddDialog from "./timetable-add-dialog"
import TimeTableGrid from "./timetablegrid"
import TimeTableEditDialog from "./timetable-edit-dialog"
import useTimetable from "@/components/TableContent"
import { useRef } from "react"
import * as ToggleGroup from "@radix-ui/react-toggle-group"

import {
    MINUTES_PER_COLUMN,
    DAY_TO_INDEX as DAY_TO_INDEX_MAP,
    DaysList,
} from "./time-utils";


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
    const [editLocation, setEditLocation] = useState("");
    const [editColor, setEditColor] = useState("");

    const { slots, loading: slotsLoading, error, reload } = useTimetable(user?._id);
    // console.log("slots from useTimetable:", slots);
    // console.log("user id in timetable page:", user?._id);

    const minutesPerColumn = MINUTES_PER_COLUMN;
    const DAY_TO_INDEX = DAY_TO_INDEX_MAP;


    //Convert slots into grid placement props
    const mappedSlots = slots.map((s) => {
        const startMin = Number(s.start_min);
        const endMin = Number(s.end_min);
        const startCol = Math.floor(startMin / minutesPerColumn) + 2;
        const spanCols = Math.max(1, Math.ceil((endMin - startMin) / minutesPerColumn));
        const row = (DAY_TO_INDEX[s.day] ?? 0) + 2;
        return {
            id: s._id || `${s.day}-${s.start_min}-${s.end_min}`,
            title: s.title,
            description: s.description,
            location: s.location,
            color: s.color || "purple",
            gridColumn: `${startCol} / span ${spanCols}`,
            gridRow: row,
            hourStart: Math.floor(startMin / 60),
            minStart: startMin % 60,
            hourEnd: Math.floor(endMin / 60),
            minEnd: endMin % 60,
            day: s.day,
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

        // convert to minutes since midnight
        const startMinutes = slot.hourStart * 60 + slot.minStart;
        const endMinutes = slot.hourEnd * 60 + slot.minEnd;
        setEditStartMin(startMinutes);
        setEditEndMin(endMinutes);

        setEditLocation(slot.location || "");
        setEditColor(slot.color || "");

        setOpenEdit(true);
    };


    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        console.log("selected slot", selectSlot.id);
        if (!selectSlot) return;

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/timetable/${selectSlot.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    location: editLocation,
                    day: editDay,
                    start_min: Number(editStartMin),
                    end_min: Number(editEndMin),
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/timetable`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        day,
                        start_min: Number(start_min),
                        end_min: Number(end_min),
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

                {/* Add Button */}
                <TimeTableAddDialog
                    open={open}
                    setOpenAdd={setOpenAdd}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    day={day}
                    setDay={setDay}
                    start_min={start_min}
                    setStart_min={setStart_min}
                    end_min={end_min}
                    setEnd_min={setEnd_min}
                    location={location}
                    setLocation={setLocation}
                    color={color}
                    handleColorChange={handleColorChange}
                    openAddDrop={openAddDrop}
                    setopenAddDrop={setopenAddDrop}
                    DaysList={DaysList}
                    handleSubmitAdd={handleSubmitAdd}
                />

                {/* Edit Button */}
                <TimeTableEditDialog
                    openEdit={openEdit}
                    setOpenEdit={setOpenEdit}
                    mappedSlots={mappedSlots}
                    selectSlot={selectSlot}
                    setSelectSlot={setSelectSlot}
                    openEditDrop={openEditDrop}
                    setopenEditDrop={setopenEditDrop}
                    spanEdit={spanEdit}
                    setSpanEdit={setSpanEdit}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editDescription={editDescription}
                    setEditDescription={setEditDescription}
                    editDay={editDay}
                    setEditDay={setEditDay}
                    editStartMin={editStartMin}
                    setEditStartMin={setEditStartMin}
                    editEndMin={editEndMin}
                    setEditEndMin={setEditEndMin}
                    editLocation={editLocation}
                    setEditLocation={setEditLocation}
                    editColor={editColor}
                    setEditColor={setEditColor}
                    handleColorChangeOnEdit={handleColorChangeOnEdit}
                    DaysList={DaysList}
                    handleSubmitEdit={handleSubmitEdit}
                />
            </div>

            {/* TimeTable Session */}
            <TimeTableGrid
                propUserId={user._id}
                onEditSlot={handleEditSlot}
            />
        </div>
    )
}
