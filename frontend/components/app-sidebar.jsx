"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
// import { UserData } from "@/(dashboard)/chats/page"

// Menu items with avatar instead of icon
const DMs = [
  { title: "Daniel", url: "#", avatar: { src: "https://github.com/shadcn.png", fallback: "HM" } },
  { title: "Malcolm", url: "#", avatar: { src: "https://github.com/vercel.png", fallback: "IN" } },
  { title: "Alex", url: "#", avatar: { src: "https://github.com/nextjs.png", fallback: "CA" } },
]

const Servers = [
  { title: "Server 1", url: "#", avatar: { src: "https://github.com/shadcn.png", fallback: "HM" }, channels: ["general", "random", "memes"] },
  { title: "Server 2", url: "#", avatar: { src: "https://github.com/vercel.png", fallback: "IN" }, channels: ["announcements", "support"] },
  { title: "Server 3", url: "#", avatar: { src: "https://github.com/nextjs.png", fallback: "CA" }, channels: ["chat", "dev-talk", "design"] },
]

export function AppSidebar() {
  const handleFooterClick = () => {
    window.location.pathname = "/profile";
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetch("http://localhost:3001/api/v1/auth/me", {
        credentials: "include",
      });
      const data = await response.json();
      setUser(data);
    };

    loadUser();
  }, []);
  // console.log(user.user.username);
  // console.log(user);

  return (
    <Sidebar>
      <SidebarContent>
        {/* KUSA logo */}
        <div className="pt-4 pl-4 mb-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            KUSA
          </div>
        </div>

        {/* Tabs for Private and Servers */}
        <Tabs defaultValue="private" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="private" className="data-[state=active]:text-white data-[state=active]:bg-gray-900">
              Private
            </TabsTrigger>
            <TabsTrigger value="servers" className="data-[state=active]:text-white data-[state=active]:bg-gray-900">
              Servers
            </TabsTrigger>
          </TabsList>

          {/* Private Tab Content */}
          <TabsContent value="private" className="mt-4">
            <SidebarGroup>
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
          </TabsContent>

          {/* Servers Tab Content */}
          <TabsContent value="servers" className="mt-4">
            <SidebarGroup>
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
          </TabsContent>
        </Tabs>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleFooterClick}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Your Name</span>
              <span className="text-xs text-muted-foreground">@{user?.user.username}</span>
            </div>
          </div>

          {/* Account Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 rounded hover:bg-gray-200">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm bg-white text-black">
              <DialogHeader>
                <DialogTitle>Account Settings</DialogTitle>
                <DialogDescription>
                  Manage your account information and settings.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 mt-4">
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Change display name</button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Change email</button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Change phone number</button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Change password</button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600">Sign out</button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600">Delete account</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
