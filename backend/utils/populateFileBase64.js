const fs = require("fs");
const path = require("path");

/**
 * Safely read file and return base64 string.
 */
function toBase64(storage_key) {
    try {
        if (!storage_key) return null;

        // Normalize path: remove leading "/", so "/storage/abc.png" becomes "storage/abc.png"
        const normalized = storage_key.startsWith("/")
            ? storage_key.substring(1)
            : storage_key;

        const filePath = path.join(__dirname, "..", normalized);

        const buffer = fs.readFileSync(filePath);
        return buffer.toString("base64");
    } catch (err) {
        console.error("toBase64 error:", err.message);
        return null;
    }
}

/**
 * Recursively walk any object and inject base64 into File documents.
 *
 * A File doc is recognized by:
 * - storage_key
 * - mime_type
 * - byte_size
 */
function populateFileBase64(obj) {
    if (!obj || typeof obj !== "object") return;

    // If this is a File document
    if (
        obj.storage_key &&
        obj.mime_type &&
        typeof obj.byte_size === "number"
    ) {
        obj.base64 = toBase64(obj.storage_key);
        return;
    }

    // Otherwise recursively scan children
    for (const key of Object.keys(obj)) {
        const value = obj[key];

        if (Array.isArray(value)) {
            value.forEach(v => populateFileBase64(v));
        } else if (value && typeof value === "object") {
            populateFileBase64(value);
        }
    }
}

module.exports = populateFileBase64;
