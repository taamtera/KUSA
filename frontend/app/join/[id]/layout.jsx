// /app/dashboard/layout.jsx
import { cookies } from "next/headers";
import { UserProvider } from "@/context/UserContext";

export default async function Layout({ children }) {
  const cookieStore = cookies(); // 🧩 Access incoming cookies
  const cookieHeader = cookieStore.toString(); // Convert to string header

  const res = await fetch("http://localhost:3001/api/v1/auth/me", {
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
        <main className="flex-1">{children}</main>
    </UserProvider>
  );
}
