import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"

export default function Layout({ children }) {
  return (
    <SidebarProvider
      defaultOpen={true}
      collapsible="offcanvas"
      breakpoint="md"
    >

        {/* Main Content */}
        <main className="flex-1">
        {/* Mobile trigger
        <div className="md:hidden p-4">
          <SidebarTrigger />
        </div> */}
        {children}
        </main>

        {/* Right Sidebar */}
        <ChatSidebar />
    </SidebarProvider>
  )
}