import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Menu items with avatar instead of icon
const DMs = [
  {
    title: "Daniel",
    url: "#",
    avatar: {
      src: "https://github.com/shadcn.png",
      fallback: "HM",
    },
  },
  {
    title: "Malcolm",
    url: "#",
    avatar: {
      src: "https://github.com/vercel.png",
      fallback: "IN",
    },
  },
  {
    title: "Alex",
    url: "#",
    avatar: {
      src: "https://github.com/nextjs.png",
      fallback: "CA",
    },
  }
]

const Servers = [
  {
    title: "Server 1",
    url: "#",
    avatar: {
      src: "https://github.com/shadcn.png",
      fallback: "HM",
    },
  },
  {
    title: "Server 2",
    url: "#",
    avatar: {
      src: "https://github.com/vercel.png",
      fallback: "IN",
    },
  },
  {
    title: "Server 3",
    url: "#",
    avatar: {
      src: "https://github.com/nextjs.png",
      fallback: "CA",
    },
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {DMs.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.avatar.src} />
                        <AvatarFallback>{item.avatar.fallback}</AvatarFallback>
                      </Avatar>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Servers</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Servers.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.avatar.src} />
                        <AvatarFallback>{item.avatar.fallback}</AvatarFallback>
                      </Avatar>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
