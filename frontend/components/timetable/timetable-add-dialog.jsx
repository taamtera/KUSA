"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label>Day</label>
                                <select
                                    className="w-full border rounded px-2 text-[14px] h-[34px]"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                >
                                    <option value="" disabled>
                                        SELECT DAY
                                    </option>
                                    {DaysList.map((d) => (
                                        <option key={d.value} value={d.value}>
                                            {d.value.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1">
                                <label>Start (hr)</label>
                                <Input
                                    value={start_min}
                                    onChange={(e) => setStart_min(e.target.value)}
                                    className="text-[14px] h-[34px]"
                                />
                            </div>

                            <div className="flex-1">
                                <label>End (hr)</label>
                                <Input
                                    value={end_min}
                                    onChange={(e) => setEnd_min(e.target.value)}
                                    className="text-[14px] h-[34px]"
                                />
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
