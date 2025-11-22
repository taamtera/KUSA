// /app/dashboard/layout.jsx
import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserProvider } from "@/context/UserContext";
import { UserSidebar } from "@/components/user-sidebar"

export default async function Layout({ children }) {
  const cookieStore = cookies(); // 🧩 Access incoming cookies
  const cookieHeader = cookies().toString(); // Convert to string header
  console.log("🍪 Incoming cookies:", cookieHeader);


  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
    headers: {
      Cookie: cookieHeader,
    },
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json();
  console.log("🔐 Authenticated user data:", data);
  const user = data.user || null;

  return (
    <UserProvider initialUser={user}>
      <SidebarProvider defaultOpen collapsible="offcanvas" breakpoint="md">
        <AppSidebar />
        <main className="flex-1 mx-auto w-[calc(100vw-560px)]">{children}</main>
        <UserSidebar className="pl6 border-none"/>
      </SidebarProvider>
    </UserProvider>
  );
}
