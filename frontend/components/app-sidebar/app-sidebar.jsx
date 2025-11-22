"use client"

import { useState, useEffect, use } from "react"
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarFallback, formatDividerTime } from "@/components/utils"
import { DMsTab } from "./dms-tab"
import { ServersTab } from "./servers-tab"
import { AccountSettingsDialog } from "./account-settings-dialog"
import { AddServerDialog } from "./add-server-dialog"
import { AddFriendDialog } from "./add-friend-dialog"
import { useUser } from "@/context/UserContext"

export function AppSidebar() {
    const { user } = useUser()

    const handleFooterClick = () => {
        window.location.pathname = "/profile"
    }

    return (
        <Sidebar>
            <SidebarContent>
                {/* KUSA logo */}
                <div className="pt-4 pl-4 mb-6">
                    <div className="text-3xl font-bold bg-linear-to-r from-green-600 to-50% to-yellow-400 bg-clip-text text-transparent">KUSA</div>
                </div>

                {/* Tabs */}
                <Tabs className="w-full" defaultValue="private">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="private" className="data-[state=active]:text-white data-[state=active]:bg-gray-900 hover:bg-gray-200 cursor-pointer">
                            Private
                        </TabsTrigger>
                        <TabsTrigger value="servers" className="data-[state=active]:text-white data-[state=active]:bg-gray-900 hover:bg-gray-200 cursor-pointer">
                            Servers
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="private" className="mt-4">
                        <DMsTab user={user} />
                    </TabsContent>

                    <TabsContent value="servers" className="mt-4 ">
                        <ServersTab user={user} />
                    </TabsContent>
                </Tabs>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleFooterClick}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`data:${user.icon_file?.mime_type};base64,${user.icon_file?.base64}`} />
                            <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{user?.display_name}</span>
                            <span className="text-xs text-muted-foreground">@{user?.username}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-0.1">
                        <AddFriendDialog />
                        <AddServerDialog />
                        <AccountSettingsDialog />
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
