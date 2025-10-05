// Helper function to get avatar URL
export function getAvatarUrl(iconFile) {
	if (!iconFile) return null

	if (iconFile.is_external === true) {
		return iconFile.storage_key
	} else {
		return `/api/files/${iconFile.storage_key}`
	}
}

export function formatTime(dateString) {
	const date = new Date(dateString)
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Helper function to get fallback text
export function getAvatarFallback(username) {
	return username ? username.charAt(0).toUpperCase() : "U"
}

export function formatDividerTime(dateString) {
	const d = new Date(dateString)
	return `${d.getDate()}/${d.getMonth() + 1} ${d
		.getHours()
		.toString()
		.padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}
