"use client"
import { createContext, useContext, useState, useCallback } from "react"

const UserContext = createContext(null)

export function UserProvider({ children, initialUser }) {
	const [user, setUser] = useState(initialUser)

	const refreshUser = useCallback(async () => {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
			credentials: "include"
		})

		const data = await res.json()
		if (data.status === "success") {
			setUser(data.user)
		}
	}, [])

	return (
		<UserContext.Provider value={{ user, setUser, refreshUser }}>
			{children}
		</UserContext.Provider>
	)
}

export function useUser() {
	return useContext(UserContext)
}