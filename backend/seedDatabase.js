// seedDatabase.js
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const {
	User,
	File,
	Server,
	Member,
	Room,
	Message,
	Attachment,
	Reaction,
} = require("./schema.js")

async function InitializeDatabaseStructures(RESET_SEEDED_DATA) {
	const FILE_KEYS = [
		"uploads/avatars/alice.png",
		"uploads/avatars/bob.png",
		"uploads/avatars/cara.png",
		"uploads/icons/hub.png",
		"uploads/icons/dev.png",
		"uploads/docs/welcome.pdf",
	]

	const USER_EMAILS = [
		"alice@example.com",
		"bob@example.com",
		"cara@example.com",
	]
	const SERVER_NAMES = ["General Hub", "Dev Corner"]
	const ROOMS_BY_TITLE = ["general", "announcements", "dev-chat"]

	try {
		// 1️⃣ Lookup existing seed docs
		const seedFiles = await File.find(
			{ storage_key: { $in: FILE_KEYS } },
			{ _id: 1 }
		).lean()
		const seedUsers = await User.find(
			{ email: { $in: USER_EMAILS } },
			{ _id: 1 }
		).lean()
		const seedServers = await Server.find(
			{ server_name: { $in: SERVER_NAMES } },
			{ _id: 1 }
		).lean()
		const seedFileIds = seedFiles.map((d) => d._id)
		const seedUserIds = seedUsers.map((d) => d._id)
		const seedServerIds = seedServers.map((d) => d._id)

		const seedRooms = await Room.find({
			$or: [
				{ server: { $in: seedServerIds } },
				{ title: { $in: ROOMS_BY_TITLE } },
			],
		}).lean()
		const seedRoomIds = seedRooms.map((d) => d._id)

		const seedMembers = await Member.find({
			$or: [{ server: { $in: seedServerIds } }, { user: { $in: seedUserIds } }],
		}).lean()
		const seedMemberIds = seedMembers.map((d) => d._id)

		const seedMessages = await Message.find({
			$or: [
				{ room: { $in: seedRoomIds } },
				{ sender: { $in: seedMemberIds } },
				{ recipients: { $in: seedMemberIds } },
			],
		}).lean()
		const seedMessageIds = seedMessages.map((d) => d._id)

		// 2️⃣ Clear existing seed data if RESET_SEEDED_DATA == true
		if (RESET_SEEDED_DATA === "true") {
			await Reaction.deleteMany({ message: { $in: seedMessageIds } })
			await Attachment.deleteMany({
				$or: [
					{ message: { $in: seedMessageIds } },
					{ file: { $in: seedFileIds } },
				],
			})
			await Message.deleteMany({ _id: { $in: seedMessageIds } })
			await Room.deleteMany({ _id: { $in: seedRoomIds } })
			await Member.deleteMany({ _id: { $in: seedMemberIds } })
			await Server.deleteMany({ _id: { $in: seedServerIds } })
			await User.deleteMany({ _id: { $in: seedUserIds } })
			await File.deleteMany({ _id: { $in: seedFileIds } })
			console.log("🧹 Existing seed data cleared")
		}

		// 3️⃣ Recreate seed data
		const [fAliceAva, fBobAva, fCaraAva, fHubIcon, fDevIcon, fWelcomeDoc] =
			await File.create([
				{
					storage_key: "https://github.com/shadcn.png",
					original_name: "alice.png",
					mime_type: "image/png",
					byte_size: 123456,
					is_external: true,
				},
				{
					storage_key: "https://github.com/vercel.png",
					original_name: "bob.png",
					mime_type: "image/png",
					byte_size: 123456,
					is_external: true,
				},
				{
					storage_key: "https://github.com/nextjs.png",
					original_name: "cara.png",
					mime_type: "image/png",
					byte_size: 123456,
					is_external: true,
				},
				{
					storage_key: "uploads/icons/hub.png",
					original_name: "hub.png",
					mime_type: "image/png",
					byte_size: 12345,
				},
				{
					storage_key: "uploads/icons/dev.png",
					original_name: "dev.png",
					mime_type: "image/png",
					byte_size: 12345,
				},
				{
					storage_key: "uploads/docs/welcome.pdf",
					original_name: "welcome.pdf",
					mime_type: "application/pdf",
					byte_size: 54321,
				},
			])

		const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10
		const [aliceHash, bobHash, caraHash] = await Promise.all([
			bcrypt.hash("alice123!", ROUNDS),
			bcrypt.hash("bob123!", ROUNDS),
			bcrypt.hash("cara123!", ROUNDS),
		])

		const [alice, bob, cara] = await User.create([
			{
				username: "alice",
				email: "alice@example.com",
				password_hash: aliceHash,
				icon_file: fAliceAva._id,
				role: "USER",
				description: "Product manager",
			},
			{
				username: "bob",
				email: "bob@example.com",
				password_hash: bobHash,
				icon_file: fBobAva._id,
				role: "USER",
				description: "Backend dev",
			},
			{
				username: "cara",
				email: "cara@example.com",
				password_hash: caraHash,
				icon_file: fCaraAva._id,
				role: "USER",
				description: "Designer",
			},
		])

		alice.friends = [bob._id, cara._id]
		bob.friends = [alice._id, cara._id]
		cara.friends = [alice._id, bob._id]
		await Promise.all([alice.save(), bob.save(), cara.save()])

		const [hub, dev] = await Server.create([
			{ server_name: "General Hub" },
			{ server_name: "Dev Corner" },
		])

		const [roomGeneral, roomAnnouncements, roomDevChat] = await Room.create([
			{
				title: "general",
				icon_file: fHubIcon._id,
				server: hub._id,
				room_type: "TEXT",
			},
			{
				title: "announcements",
				icon_file: fHubIcon._id,
				server: hub._id,
				room_type: "ANNOUNCEMENT",
			},
			{
				title: "dev-chat",
				icon_file: fDevIcon._id,
				server: dev._id,
				room_type: "TEXT",
			},
		])

		const [aliceHub, bobHub, caraHub, aliceDev, bobDev] = await Member.create([
			{ user: alice._id, server: hub._id, nickname: "Alice", role: "owner" },
			{ user: bob._id, server: hub._id, nickname: "Bob", role: "member" },
			{ user: cara._id, server: hub._id, nickname: "Cara", role: "member" },
			{ user: alice._id, server: dev._id, nickname: "Alice", role: "member" },
			{ user: bob._id, server: dev._id, nickname: "Bob", role: "moderator" },
		])

		const m1 = await Message.create({
			sender: aliceHub._id,
			recipients: [aliceHub._id, bobHub._id, caraHub._id],
			context: roomGeneral._id,
			context_type: "Room",
			content:
				"Welcome to **General Hub**! 📌 Please check the announcement channel.",
			message_type: "text",
		})

		const m2 = await Message.create({
			sender: bobHub._id,
			recipients: [aliceHub._id, bobHub._id, caraHub._id],
			context: roomGeneral._id,
			context_type: "Room",
			reply_to: m1._id,
			content: "Thanks @alice! I just uploaded the onboarding guide.",
			message_type: "text",
		})

		await Attachment.create({
			message: m2._id,
			file: fWelcomeDoc._id,
			position: 1,
		})

		await Message.create([
			{
				sender: aliceHub._id,
				recipients: [bobHub._id],
				context: bob._id,
				context_type: "User",
				content: "Hey Bob, quick question about the API keys.",
				message_type: "text",
			},
			{
				sender: bobHub._id,
				recipients: [aliceHub._id, caraHub._id],
				context: alice._id,
				context_type: "User",
				content: "Team—design handoff at 3 PM. Can you both review the Figma?",
				message_type: "text",
			},
			{
				sender: bobDev._id,
				recipients: [bobDev._id],
				context: roomDevChat._id,
				context_type: "Room",
				content:
					"Heads up: staging deploy at 17:00 UTC+7. Ping me if you see issues.",
				message_type: "text",
			},
		])

		await Reaction.create([
			{ message: m1._id, member: bobHub._id, emoji: "👍" },
			{ message: m1._id, member: caraHub._id, emoji: "🎉" },
			{ message: m2._id, member: aliceHub._id, emoji: "❤️" },
		])

		console.log("✅ Database seed complete")
	} catch (err) {
		console.error("❌ Seed error:", err)
	}
}

module.exports = InitializeDatabaseStructures
