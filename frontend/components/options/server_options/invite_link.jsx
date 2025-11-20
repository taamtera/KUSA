import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function InviteLink({ isOpen, onClose, inviteLink }) {
  const [copied, setCopied] = useState(false)
    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Link</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input value={inviteLink} readOnly />
                    <Button onClick={handleCopy}>
                        {copied ? "Copied!" : "Copy Link"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}