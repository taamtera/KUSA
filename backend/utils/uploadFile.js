const path = require("path")
const fs = require("fs/promises")
const { File, User, Server, Attachment } = require("../schema.js")

async function uploadFile(reqFile, type, id) {
    if (!reqFile) throw new Error("No file uploaded")

    // Extract options (sent from body)

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

            await User.findByIdAndUpdate(id, { icon_file: fileDoc._id })
            break

        case "banner":
            await User.findByIdAndUpdate(id, { banner_file: fileDoc._id })
            break

        case "server_icon":
            await Server.findByIdAndUpdate(serverId, { icon_file: fileDoc._id })
            break

        case "attachment":
            await Attachment.create({
                message: id,
                file: fileDoc._id,
                position: 1,
            })
            break
        default:
            break;

    }

    return fileDoc
}

module.exports = uploadFile
