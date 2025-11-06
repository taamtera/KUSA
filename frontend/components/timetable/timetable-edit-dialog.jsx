"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TimeTableEditDialog({
    openEdit,
    setOpenEdit,
    mappedSlots,
    selectSlot,
    setSelectSlot,
    openEditDrop,
    setopenEditDrop,
    spanEdit,
    setSpanEdit,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editDay,
    setEditDay,
    editStartMin,
    setEditStartMin,
    editEndMin,
    setEditEndMin,
    editLocation,
    setEditLocation,
    editColor,
    setEditColor,
    handleColorChangeOnEdit,
    DaysList,
    handleSubmitEdit,
}) {

    function leadingTwoZero(val) {
        return val.toString().padStart(2, "0")
    };

    return (
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogTrigger asChild>
                <Button className="absolute right-10 px-4 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded w-15">
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
                    
                    {/* Edit session */}
                    {spanEdit && (
                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden text-[16px]">

                            {/* Class name */}
                            <div>
                                <label>Class name</label>
                                <textarea
                                    className="w-full border rounded p-2 text-[14px] h-[36px]"
                                    value={editTitle}
                                    maxLength={120}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                                <p className={`text-[12px] flex justify-end ${editTitle.length === 120 ? "text-red-500" : ""}`}>{editTitle.length}/120</p>
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
                            
                            {/* Description */}
                            <div>
                                <label>Description</label>
                                <textarea
                                    className="w-full border rounded p-2 text-[14px] h-[56px]"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label>Location</label>
                                <textarea
                                    className="w-full border rounded p-2 text-[14px] h-[34px]"
                                    value={editLocation}
                                    onChange={(e) => setEditLocation(e.target.value)}
                                />
                            </div>
                            
                            {/* Color */}
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
    )
}