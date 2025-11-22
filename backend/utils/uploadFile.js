const path = require("path")
const fs = require("fs/promises")
const { File, User, Server, Attachment } = require("../schema.js")

async function uploadFile(reqFile, type, options = {}) {
    if (!reqFile) throw new Error("No file uploaded")

    // Extract options (sent from body)
    const { userId, serverId, messageId, position = 1 } = options

    // 1️⃣ Create empty File document
    let fileDoc = await File.create({
        storage_key: null,
        is_external: false,
    })

    const fileId = fileDoc._id.toString()
    const ext = path.extname(reqFile.originalname)
    const fileName = `${fileId}${ext}` // filename = mongodb ObjectId

    const storageDir = path.join(__dirname, "..", "storage")
    const finalPath = path.join(storageDir, fileName)

    await fs.mkdir(storageDir, { recursive: true })
    await fs.writeFile(finalPath, reqFile.buffer)

    // 2️⃣ Add metadata
    fileDoc.storage_key = `/storage/${fileName}`
    fileDoc.original_name = reqFile.originalname
    fileDoc.mime_type = reqFile.mimetype
    fileDoc.byte_size = reqFile.size
    await fileDoc.save()

    // 3️⃣ Apply file usage
    switch (type) {
        case "pfp":
            if (!userId) throw new Error("Missing userId")
            await User.findByIdAndUpdate(userId, { icon_file: fileDoc._id })
            break

        case "banner":
            if (!userId) throw new Error("Missing userId")
            await User.findByIdAndUpdate(userId, { banner_file: fileDoc._id })
            break

        case "server_icon":
            if (!serverId) throw new Error("Missing serverId")
            await Server.findByIdAndUpdate(serverId, { icon_file: fileDoc._id })
            break

        case "attachment":
            if (!messageId) throw new Error("Missing messageId")
            await Attachment.create({
                message: messageId,
                file: fileDoc._id,
                position,
            })
            break

        default:
            throw new Error(`Unknown upload type: ${type}`)
    }

    return fileDoc
}

module.exports = uploadFile
