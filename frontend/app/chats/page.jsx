import { Send, Paperclip, Hash, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function Chat() {
  return (
    <div className="flex flex-col h-full">
      {/* Main content area - takes up available space */}
      <div className="flex-1"></div>
      
      {/* Textarea fixed at bottom */}
      <div className="p-4 border-t flex items-center gap-2">
        <Button variant="outline">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea placeholder="Message" className="flex-1 resize-none" />
        <Button variant="outline">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}