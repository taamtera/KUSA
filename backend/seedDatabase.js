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
	    // ---------- 1) Define seed keys (unique identifiers) ----------
        const FILE_KEYS = [
            'uploads/avatars/alice.png',
            'uploads/avatars/bob.png',
            'uploads/avatars/cara.png',
            'uploads/icons/hub.png',
            'uploads/icons/dev.png',
            'uploads/docs/welcome.pdf',
        ];
    
        const USER_EMAILS = [
            'alice@example.com',
            'bob@example.com',
            'cara@example.com',
        ];
    
        const SERVER_NAMES = [
            'General Hub',
            'Dev Corner',
        ];
    
        const ROOMS_BY_TITLE = [
            'general',
            'announcements',
            'dev-chat',
        ];
    
        // ---------- 2) Lookup existing seed docs ----------
        const seedFiles = await File.find({ storage_key: { $in: FILE_KEYS } }, { _id: 1 }).lean();
        const seedUsers = await User.find({ email: { $in: USER_EMAILS } }, { _id: 1 }).lean();
        const seedServers = await Server.find({ server_name: { $in: SERVER_NAMES } }, { _id: 1 }).lean();
    
        const seedFileIds = seedFiles.map(d => d._id);
        const seedUserIds = seedUsers.map(d => d._id);
        const seedServerIds = seedServers.map(d => d._id);
    
        // Rooms and members depend on servers/users
        const seedRooms = await Room.find({
            $or: [
                { server: { $in: seedServerIds } },
                { title: { $in: ROOMS_BY_TITLE } }
            ]
        }, { _id: 1 }).lean();
    
        const seedRoomIds = seedRooms.map(d => d._id);
    
        const seedMembers = await Member.find({
            $or: [
                { server: { $in: seedServerIds } },
                { user: { $in: seedUserIds } }
            ]
        }, { _id: 1, server: 1, user: 1 }).lean();
    
        const seedMemberIds = seedMembers.map(d => d._id);
    
        // Messages tied to (rooms or members)
        const seedMessages = await Message.find({
            $or: [
            { context_type: 'Room', context: { $in: seedRoomIds } },
            { sender: { $in: seedMemberIds } },
            { recipients: { $in: seedMemberIds } },
            ]
        }, { _id: 1 }).lean();
    
        const seedMessageIds = seedMessages.map(d => d._id);
    
        // ---------- 3) Delete only seed data (children → parents) ----------
    
        // reactions (child of message)
        if (seedMessageIds.length) {
            await Reaction.deleteMany({ message: { $in: seedMessageIds } });
        }
    
        // attachments by (message OR file)
        if (seedMessageIds.length || seedFileIds.length) {
            const or = [];
            if (seedMessageIds.length) or.push({ message: { $in: seedMessageIds } });
            if (seedFileIds.length) or.push({ file: { $in: seedFileIds } });
            await Attachment.deleteMany({ $or: or });
        }
    
        // messages
        if (seedMessageIds.length) {
            await Message.deleteMany({ _id: { $in: seedMessageIds } });
        }
    
        // rooms & members
        if (seedRoomIds.length) await Room.deleteMany({ _id: { $in: seedRoomIds } });
        if (seedMemberIds.length) await Member.deleteMany({ _id: { $in: seedMemberIds } });
    
        // servers, users, files
        if (seedServerIds.length) await Server.deleteMany({ _id: { $in: seedServerIds } });
        if (seedUserIds.length) await User.deleteMany({ _id: { $in: seedUserIds } });
        if (seedFileIds.length) await File.deleteMany({ _id: { $in: seedFileIds } });
    
    
        // ---------- 4) Recreate the seed data ----------
        // Files
        const [fAliceAva, fBobAva, fCaraAva, fHubIcon, fDevIcon, fWelcomeDoc] = await File.create([
            // { storage_key: 'uploads/avatars/alice.png', original_name: 'alice.png', mime_type: 'image/png', byte_size: 123456 },
            // { storage_key: 'uploads/avatars/bob.png', original_name: 'bob.png', mime_type: 'image/png', byte_size: 123456 },
            // { storage_key: 'uploads/avatars/cara.png', original_name: 'cara.png', mime_type: 'image/png', byte_size: 123456 },
            { storage_key: 'https://github.com/shadcn.png', original_name: 'alice.png', mime_type: 'image/png', byte_size: 123456, is_external: true },
            { storage_key: 'https://github.com/vercel.png', original_name: 'bob.png', mime_type: 'image/png', byte_size: 123456, is_external: true },
            { storage_key: 'https://github.com/nextjs.png', original_name: 'cara.png', mime_type: 'image/png', byte_size: 123456, is_external: true },
            { storage_key: 'uploads/icons/hub.png', original_name: 'hub.png', mime_type: 'image/png', byte_size: 12345 },
            { storage_key: 'uploads/icons/dev.png', original_name: 'dev.png', mime_type: 'image/png', byte_size: 12345 },
            { storage_key: 'uploads/docs/welcome.pdf', original_name: 'welcome.pdf', mime_type: 'application/pdf', byte_size: 54321 },
    
        ]);
    
        // Users (password_hash placeholders)
        const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
        
        const [aliceHash, bobHash, caraHash] = await Promise.all([
            bcrypt.hash('alice123!', ROUNDS),
            bcrypt.hash('bob123!',   ROUNDS),
            bcrypt.hash('cara123!',  ROUNDS),
        ]);
    
const [alice, bob, cara] = await User.create([
    {
        username: "alice",
        email: "alice@example.com",
        password_hash: aliceHash,
        icon_file: fAliceAva._id,
        banner_file: fHubIcon._id,
        role: "USER",
        bio: "Product manager focused on collaboration and growth.",
        major: "Business Management",
        faculty: "Business",
        pronouns: "She/Her",
        phone: "0909092200",
    },
    {
        username: "bob",
        email: "bob@example.com",
        password_hash: bobHash,
        icon_file: fBobAva._id,
        banner_file: fDevIcon._id,
        role: "USER",
        bio: "Backend developer who loves clean APIs and strong coffee.",
        major: "Computer Engineering",
        faculty: "Engineering",
        pronouns: "He/Him",
        phone: "0909092201",
    },
    {
        username: "cara",
        email: "cara@example.com",
        password_hash: caraHash,
        icon_file: fCaraAva._id,
        banner_file: fHubIcon._id,
        role: "USER",
        bio: "Designer passionate about creating accessible, beautiful interfaces.",
        major: "Design and Communication",
        faculty: "Arts",
        pronouns: "They/Them",
        phone: "0909092202",
    },
])
    
        //Friends
        alice.friends = [bob._id, cara._id];
        bob.friends = [alice._id, cara._id];
        cara.friends = [alice._id, bob._id];
        await Promise.all([alice.save(), bob.save(), cara.save()]);
    
        // Servers
        const [hub, dev] = await Server.create([
            { server_name: 'General Hub' },
            { server_name: 'Dev Corner' },
        ]);
    
        // Rooms
        const [roomGeneral, roomAnnouncements, roomDevChat] = await Room.create([
            { title: 'general', icon_file: fHubIcon._id, server: hub._id, room_type: 'TEXT' },
            { title: 'announcements', icon_file: fHubIcon._id, server: hub._id, room_type: 'ANNOUNCEMENT' },
            { title: 'dev-chat', icon_file: fDevIcon._id, server: dev._id, room_type: 'TEXT' },
        ]);
    
        // Members
        const [aliceHub, bobHub, caraHub, aliceDev, bobDev] = await Member.create([
            { user: alice._id, server: hub._id, nickname: 'Alice', role: 'owner' },
            { user: bob._id, server: hub._id, nickname: 'Bob', role: 'member' },
            { user: cara._id, server: hub._id, nickname: 'Cara', role: 'member' },
            { user: alice._id, server: dev._id, nickname: 'Alice', role: 'member' },
            { user: bob._id, server: dev._id, nickname: 'Bob', role: 'moderator' },
        ]);
    
        // Messages & Attachments
    const m1 = await Message.create({
        sender: aliceHub._id,
        recipients: [aliceHub._id, bobHub._id, caraHub._id], // Add recipients for room messages
        context: roomGeneral._id,
        context_type: 'Room',
        content: 'Welcome to **General Hub**! 📌 Please check the announcement channel.',
        message_type: 'text',
    });
    
    const m2 = await Message.create({
        sender: bobHub._id,
        recipients: [aliceHub._id, bobHub._id, caraHub._id],
        context: roomGeneral._id,
        context_type: 'Room',
        reply_to: m1._id,
        content: 'Thanks @alice! I just uploaded the onboarding guide.',
        message_type: 'text',
    });
    
    await Attachment.create({
        message: m2._id,
        file: fWelcomeDoc._id,
        position: 1,
    });
    
    // Direct messages (1-on-1) - Alice to Bob
    const dm1 = await Message.create({
        sender: aliceHub._id,
        recipients: [bobHub._id],
        context: bob._id,  // Bob's User ID (not member ID)
        context_type: 'User',
        content: 'Hey Bob, quick question about the API keys.',
        message_type: 'text',
    });
    
    // Group direct message - Bob to Alice & Cara
    const gdm1 = await Message.create({
        sender: bobHub._id,
        recipients: [aliceHub._id, caraHub._id],
        context: alice._id,  // Can use any user ID as context, or create a group DM room
        context_type: 'User',
        content: 'Team—design handoff at 3 PM. Can you both review the Figma?',
        message_type: 'text',
    });
    
    // Dev room message
    await Message.create({
        sender: bobDev._id,
        recipients: [bobDev._id], // Add appropriate recipients
        context: roomDevChat._id,
        context_type: 'Room',
        content: 'Heads up: staging deploy at 17:00 UTC+7. Ping me if you see issues.',
        message_type: 'text',
    });
    
    // Private messages between Alice and everyone else
    const aliceToBobDM = await Message.create({
        sender: aliceHub._id,
        recipients: [bobHub._id],
        context: bob._id,  // Bob's User ID
        context_type: 'User',
        content: 'Hey Bob, are we still meeting tomorrow?',
        message_type: 'text',
    });
    
    const aliceToCaraDM = await Message.create({
        sender: aliceHub._id,
        recipients: [caraHub._id],
        context: cara._id,  // Cara's User ID
        context_type: 'User',
        content: 'Hi Cara, I loved your design mockups!',
        message_type: 'text',
    });
    
    // Responses to Alice's DMs
    const bobToAliceDM = await Message.create({
        sender: bobHub._id,
        recipients: [aliceHub._id],
        context: alice._id,  // Alice's User ID
        context_type: 'User',
        content: 'Yes, meeting is still on for 2 PM!',
        message_type: 'text',
    });
    
    const caraToAliceDM = await Message.create({
        sender: caraHub._id,
        recipients: [aliceHub._id],
        context: alice._id,  // Alice's User ID
        context_type: 'User',
        content: 'Thanks Alice! Working on the final revisions now.',
        message_type: 'text',
    });
    
    // Reactions: Bob 👍 on m1, Cara 🎉 on m1, Alice ❤️ on m2
    await Reaction.create([
        { message: m1._id, member: bobHub._id, emoji: '👍' },
        { message: m1._id, member: caraHub._id, emoji: '🎉' },
        { message: m2._id, member: aliceHub._id, emoji: '❤️' },
    ]);
    
    console.log('Seed complete ✔');
}

module.exports = InitializeDatabaseStructures
