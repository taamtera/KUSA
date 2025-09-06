import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      {/* Sidebar always open on desktop, offcanvas on mobile */}
      <AppSidebar 
        className="hidden md:flex" // show inline on desktop
        collapsible="none"
        defaultOpen
      />
      <AppSidebar 
        className="flex md:hidden" // offcanvas on mobile
        collapsible="offcanvas"
      />
      
      <main className="flex-1">
        {/* trigger only needed on mobile */}
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}