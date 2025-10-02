"use client";

import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import { DMsTab } from "./dms-tab";
import { ServersTab } from "./servers-tab";


export function AppSidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/v1/auth/me", {
          credentials: "include",
        });
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  const handleFooterClick = () => {
    window.location.pathname = "/profile";
  };

  return (
    <Sidebar>
      <SidebarContent>
        {/* KUSA logo */}
        <div className="pt-4 pl-4 mb-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            KUSA
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="private" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="private" className="data-[state=active]:text-white data-[state=active]:bg-gray-900 hover:bg-gray-200">
              Private
            </TabsTrigger>
            <TabsTrigger value="servers" className="data-[state=active]:text-white data-[state=active]:bg-gray-900 hover:bg-gray-200">
              Servers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="private" className="mt-4">
            <DMsTab user={user} />
          </TabsContent>

          <TabsContent value="servers" className="mt-4">
            <ServersTab />
          </TabsContent>
        </Tabs>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleFooterClick}>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Your Name</span>
              <span className="text-xs text-muted-foreground">@{user?.username}</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 rounded hover:bg-gray-200">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm bg-white text-black">
              <DialogHeader>
                <DialogTitle>Account Settings</DialogTitle>
                <DialogDescription>Manage your account information and settings.</DialogDescription>
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
  );
}