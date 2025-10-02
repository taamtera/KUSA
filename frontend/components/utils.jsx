// Helper function to get avatar URL
export function getAvatarUrl(iconFile) {
    if (!iconFile) return null;
    
    if (iconFile.is_external === true) {
        return iconFile.storage_key;
    } else {
        return `/api/files/${iconFile.storage_key}`;
    }
}

// Helper function to get fallback text
export function getAvatarFallback(username) {
    return username ? username.charAt(0).toUpperCase() : 'U';
}