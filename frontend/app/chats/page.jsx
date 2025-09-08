import { Textarea } from "@/components/ui/textarea"

export default function Chat() {
  return (
    <div className="flex flex-col h-full">
      {/* Main content area - takes up available space */}
      <div className="flex-1"></div>
      
      {/* Textarea fixed at bottom */}
      <div className="p-4 border-t">
        <Textarea placeholder="Message" />
      </div>
    </div>
  );
}