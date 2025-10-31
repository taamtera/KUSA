import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function DMsOptions({ open, onOpenChange }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>DM Options</DialogTitle>  
                </DialogHeader>
                {/* Add DM-specific options here */}
                <div className="mt-4">
                    <p className="text-gray-600">No options available for DMs at this time.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}