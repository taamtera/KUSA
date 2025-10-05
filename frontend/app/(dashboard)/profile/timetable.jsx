"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TimeTableGrid from "./timetablegrid"

export default function ProfilePage(user) {
    const [open, setOpen] = useState(false)

    return (
        <div class="">
            <Button className="absolute py-3 mt-5 px-4 right-10 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">share</Button>
            <Button className="absolute py-3 mt-5 px-4 right-30 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">save</Button>
            <Button className="absolute py-3 mt-5 px-4 right-50 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">edit</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="absolute py-3 mt-5 px-4 right-70 cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded">add</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm bg-white text-black">
                    <DialogHeader>
                        <DialogTitle>Add to Timetable</DialogTitle>
                    </DialogHeader>
                    <form className="w-full max-w-sm space-y-4">
                        <div>
                            <label>Class name</label>
                            <input className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label>Description</label>
                            <input className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label>Day</label>
                            <input className="w-full border rounded p-2" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label>Time</label>
                                <input className="w-full border rounded p-2" placeholder="From" />
                            </div>
                            <div className="flex-1">
                                <label className="invisible">To</label>
                                <input className="w-full border rounded p-2" placeholder="To" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" className="cursor-pointer bg-transparent" onClick={() => setOpen(false)}>
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
            <TimeTableGrid user={user} />
        </div>
    )
}
