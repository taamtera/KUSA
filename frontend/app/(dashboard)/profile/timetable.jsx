"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TimeTableGrid from "./timetablegrid"
import { Input } from "@/components/ui/input"

export default function ProfilePage(user) {
    const [open, setOpen] = useState(false);
    const [isError, setIsError] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [day, setDay] = useState("");
    const [start_min, setStart_min] = useState("");
    const [end_min, setEnd_min] = useState("");
    const [location, setLocation] = useState("");
    const [color, setColor] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
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
                        start_min: Number(start_min), 
                        end_min: Number(end_min), 
                        location, 
                        color }),
                    credentials: "include"
                }
            );

            let data = await response.text();
            try {
                data = JSON.parse(data);
            } catch (jsonError) {
                data = {message: data};
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
                    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
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
                        <div>
                            <label>Day</label>
                            <Input className="w-full border rounded p-2" 
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            />
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
