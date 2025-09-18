import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown } from "lucide-react"

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
  },
]

const Servers = [
  {
    title: "Server 1",
    url: "#",
    avatar: {
      src: "https://github.com/shadcn.png",
      fallback: "HM",
    },
    channels: ["general", "random", "memes"],
  },
  {
    title: "Server 2",
    url: "#",
    avatar: {
      src: "https://github.com/vercel.png",
      fallback: "IN",
    },
    channels: ["announcements", "support"],
  },
  {
    title: "Server 3",
    url: "#",
    avatar: {
      src: "https://github.com/nextjs.png",
      fallback: "CA",
    },
    channels: ["chat", "dev-talk", "design"],
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>

        {/* Direct Messages */}
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

        {/* Servers */}
        <SidebarGroup>
          <SidebarGroupLabel>Servers</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Servers.map((server) => (
                <Collapsible key={server.title} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={server.avatar.src} />
                          <AvatarFallback>{server.avatar.fallback}</AvatarFallback>
                        </Avatar>
                        <span className="ml-2">{server.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {server.channels.map((channel) => (
                          <SidebarMenuSubItem key={channel}>
                            <a
                              href="#"
                              className="pl-8 text-sm text-muted-foreground hover:text-foreground"
                            >
                              #{channel}
                            </a>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}
