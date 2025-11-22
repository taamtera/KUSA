import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, GripVertical } from "lucide-react"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export default function RoomsTab({ server, allServers, isOwnerOrAdmin }) {
    const foundServer = allServers.find((s) => s._id === server._id)
    const [rooms, setRooms] = useState(foundServer?.rooms || [])
    const [loading, setLoading] = useState(false)

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    // Drag end — reorder rooms
    const handleDragEnd = async (event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = rooms.findIndex((r) => r._id === active.id)
        const newIndex = rooms.findIndex((r) => r._id === over.id)

        const reordered = arrayMove(rooms, oldIndex, newIndex)
        setRooms(reordered)

        // Update backend order
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms/${active.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ order: newIndex }),
        })
    }

    // Inline rename
    const handleRename = async (roomId, newName) => {
        setRooms((prev) => prev.map((r) => (r._id === roomId ? { ...r, title: newName } : r)))
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms/${roomId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title: newName }),
        })
    }

    // Delete room
    const handleDeleteRoom = async (roomId) => {
        if (rooms.length === 1) return // disable delete for last room

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms/${roomId}`, {
                method: "DELETE",
                credentials: "include",
            })
            const data = await res.json()

            if (data.status === "success") {
                setRooms(rooms.filter((r) => r._id !== roomId))
            } else {
                alert("Failed to delete room")
            }
        } catch (error) {
            console.error("Delete room error:", error)
            alert("Error deleting room")
        }
    }

    // Add new room
    const [newRoomName, setNewRoomName] = useState("")

    const addRoom = async () => {
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ serverId: server._id, title: newRoomName }),
        })
        const data = await res.json()
        setRooms([...rooms, data.room])
        setNewRoomName("")
        setLoading(false)
    }

    // Sortable room component
    const SortableRoom = ({ room, index }) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: room._id })
        const style = { transform: CSS.Transform.toString(transform), transition }

        const [localTitle, setLocalTitle] = useState(room.title)

        const handleBlur = async () => {
            if (localTitle !== room.title) {
            await handleRename(room._id, localTitle)
            }
        }

        return (
            <div ref={setNodeRef} style={style} className="p-2 border-b border-gray-200 flex justify-between items-center bg-white">
            <div className="flex items-center space-x-2">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" {...attributes} {...listeners} />
                <Input 
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleBlur}
                className="border-none p-0 text-sm font-medium"
                />
            </div>

            <Button variant="ghost" size="sm" disabled={rooms.length === 1} onClick={() => handleDeleteRoom(room._id)}>
                <Trash2 className={`h-4 w-4 ${rooms.length === 1 ? "text-gray-300" : "text-red-600"}`} />
            </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {isOwnerOrAdmin && (
                <div className="flex gap-2 mb-4">
                    <Input placeholder="New room name" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} className="flex-1" />
                    <Button disabled={!newRoomName || loading} onClick={addRoom}>
                        Add
                    </Button>
                </div>
            )}

            {rooms.length ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={rooms.map((r) => r._id)} strategy={verticalListSortingStrategy}>
                        {rooms.map((room, index) => (
                            <SortableRoom key={room._id} room={room} index={index} />
                        ))}
                    </SortableContext>
                </DndContext>
            ) : (
                <p className="text-sm text-gray-500">No rooms available.</p>
            )}
        </div>
    )
}
