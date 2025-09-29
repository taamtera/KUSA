import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export default function Layout({ children }) {
  return (
    <SidebarProvider
      defaultOpen={true}
      collapsible="offcanvas"
      breakpoint="md" // Collapse to offcanvas below md breakpoint
    >
      {/* Single sidebar instance */}
      <AppSidebar />
      
      <main className="flex-1">
        {/* Mobile trigger
        <div className="md:hidden p-4">
          <SidebarTrigger />
        </div> */}
        {children}
      </main>
    </SidebarProvider>
  )
}