const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const app = express().use(cors()).use(express.json());

// Import schema
const { User, File, Server, Member, Room, Message, Attachment } = require('./schema.js');

const PORT = 3001;
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/kusa';

const SALT = 10;

let db_status = false;

// //mongose Schema
// const Task = mongoose.model('Task', new mongoose.Schema({
//     text: String,
//     completed: Boolean
// }));

// ROUTES

app.get('/', async (req, res) => {
    console.log("Health check received");
    let data = { backend: true, database: db_status };
    // let data = { profile: {username: "name", image: "asd.png"}}
    res.send(data);
});

// app.get('/profile/:id', async (req, res) => {
//     console.log("Health check received");
//     let data = { profile: {username: "name", image: "asd.png", id: req.params.id}}
//     res.send(data);
// });

// post DATA FROM FRONTEND TO BACKEND (SAVE)
app.post('/api/v1/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        let isMatch = false;

        if (user) {
        isMatch = await bcrypt.compare(password, user.password_hash);
        }

        if (!user || !isMatch) {
        console.warn(`Login failed for email: ${email}`); // log internally
        return res.status(401).send("Wrong username or password ❌");
        }

        // If we get here → login success
        res.send("✅ Login successful");
    } catch(err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


// CREATE ACCOUNT
app.post('/api/v1/login/register', async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password, password_confirmation } = req.body;
        

        // Tell missing required fields
        const missing = [];
        if (!username) missing.push("username");
        if (!email) missing.push("email");
        if (!password) missing.push("password");
        if (!password_confirmation) missing.push("password_confirmation");

        if (missing.length > 0) {
        return res.status(400).send(`Missing required fields: ${missing.join(", ")}`);
        }
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
        return res.status(409).send("This email has already been registered");
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
        return res.status(409).send("This username is already taken");
        }

        // Check if password and password confirmation match
        if (password != password_confirmation) {
            res.status(400).send("Password and Confirm Password don't match")
        }

        // Hash password
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username: username,
            email: email,
            password_hash: hashedPassword
        });

        await newUser.save();
        res.json({message: "Registration Success", });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


app.get('/api/v1/user/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select("-_id -password_hash");

    if (!user) {
    return res.status(404).send("User not found");
    }

    const userJSON = JSON.stringify(user);
    console.log(userJSON);
    res.send(userJSON);
});

app.put('/api/v1/users/:id', async (req, res) => {
    try {
        const { id } = req.params; // user id from URL
        const { username, email, description } = req.body; // fields client can update

        // Find user by ID
        const user = await User.findById(id);
        if (!user) {
        return res.status(404).send("User not found ❌");
        }
        
        // Check if email is taken
        if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(409).send("Email is already taken ❌");
        }
        user.email = email;
        }
        
        // Check if username is taken
        if (username && username !== user.username) {
        const nameExists = await User.findOne({ username });
        if (nameExists) {
            return res.status(409).send("Username is already taken ❌");
        }
        user.username = username;
        }

        // Update allowed fields only
        if (username) user.username = username;
        if (email) user.email = email;
        if (description) user.description = description;

        // Save updated user
        await user.save();

        res.json({ message: "✅ Profile updated", user });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error ❌");
    }
});

// get DATA FROM BACKEND TO FRONTEND
// app.get('/tasks', async (req, res) => {
//     const tasks = await Task.find();
//     res.json(tasks);
// });

// post DATA FROM FRONTEND TO BACKEND (SAVE)
// app.post('/tasks', async (req, res) => {
//     const task = await Task.create(req.body);
//     res.json(task);
// });

// putDATA FROM FRONTEND TO BACKEND (UPDATE)
// app.put('/tasks/:id', async (req, res) => {
//     const task = await Task.findByIdAndUpdate(req.params.id, req.body);
//     res.json(task);
// });

// WILL NOT BE USING DELTE
// instead use "active" flag to remove data
// app.delete('/tasks/:id', async (req, res) => {
//     await Task.findByIdAndDelete(req.params.id);
//     res.sendStatus(204);
// });

async function ResetAndSeedSimple() {
    console.log('Resetting only seeded data, then inserting…');

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
    const seedFiles   = await File.find({ storage_key: { $in: FILE_KEYS } }, { _id: 1 }).lean();
    const seedUsers   = await User.find({ email: { $in: USER_EMAILS } }, { _id: 1 }).lean();
    const seedServers = await Server.find({ server_name: { $in: SERVER_NAMES } }, { _id: 1 }).lean();

    const seedFileIds   = seedFiles.map(d => d._id);
    const seedUserIds   = seedUsers.map(d => d._id);
    const seedServerIds = seedServers.map(d => d._id);

    // Rooms and members depend on servers/users
    const seedRooms   = await Room.find({
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
        { room: { $in: seedRoomIds } },
        { sender: { $in: seedMemberIds } },
        { recipients: { $elemMatch: { $in: seedMemberIds } } },
        ]
    }, { _id: 1 }).lean();

    const seedMessageIds = seedMessages.map(d => d._id);

    // ---------- 3) Delete only seed data (children → parents) ----------
    // attachments by (message/file)
    if (seedMessageIds.length) {
        await Attachment.deleteMany({ message: { $in: seedMessageIds } });
    }
    if (seedFileIds.length) {
        await Attachment.deleteMany({ file: { $in: seedFileIds } });
    }

    // messages
    if (seedMessageIds.length) {
        await Message.deleteMany({ _id: { $in: seedMessageIds } });
    }

    // rooms & members
    if (seedRoomIds.length) {
        await Room.deleteMany({ _id: { $in: seedRoomIds } });
    }
    if (seedMemberIds.length) {
        await Member.deleteMany({ _id: { $in: seedMemberIds } });
    }

    // servers, users, files
    if (seedServerIds.length) {
        await Server.deleteMany({ _id: { $in: seedServerIds } });
    }
    if (seedUserIds.length) {
        await User.deleteMany({ _id: { $in: seedUserIds } });
    }
    if (seedFileIds.length) {
        await File.deleteMany({ _id: { $in: seedFileIds } });
    }

    // ---------- 4) Recreate the seed data ----------
    // Files
    const [fAliceAva, fBobAva, fCaraAva, fHubIcon, fDevIcon, fWelcomeDoc] = await File.create([
        { storage_key: 'uploads/avatars/alice.png', original_name: 'alice.png', mime_type: 'image/png', byte_size: 123456 },
        { storage_key: 'uploads/avatars/bob.png',   original_name: 'bob.png',   mime_type: 'image/png', byte_size: 123456 },
        { storage_key: 'uploads/avatars/cara.png',  original_name: 'cara.png',  mime_type: 'image/png', byte_size: 123456 },
        { storage_key: 'uploads/icons/hub.png',     original_name: 'hub.png',   mime_type: 'image/png', byte_size: 12345  },
        { storage_key: 'uploads/icons/dev.png',     original_name: 'dev.png',   mime_type: 'image/png', byte_size: 12345  },
        { storage_key: 'uploads/docs/welcome.pdf',  original_name: 'welcome.pdf', mime_type: 'application/pdf', byte_size: 54321 },
    ]);

    // Users (password_hash placeholders)
    const [alice, bob, cara] = await User.create([
        { username: 'alice', email: 'alice@example.com', password_hash: 'bcrypt$example', icon_file: fAliceAva._id, role: 'USER', description: 'Product manager' },
        { username: 'bob',   email: 'bob@example.com',   password_hash: 'bcrypt$example', icon_file: fBobAva._id,   role: 'USER', description: 'Backend dev' },
        { username: 'cara',  email: 'cara@example.com',  password_hash: 'bcrypt$example', icon_file: fCaraAva._id,  role: 'USER', description: 'Designer' },
    ]);

    // Servers
    const [hub, dev] = await Server.create([
        { server_name: 'General Hub' },
        { server_name: 'Dev Corner'  },
    ]);

    // Rooms
    const [roomGeneral, roomAnnouncements, roomDevChat] = await Room.create([
        { title: 'general',       icon_file: fHubIcon._id, server: hub._id, room_type: 'TEXT' },
        { title: 'announcements', icon_file: fHubIcon._id, server: hub._id, room_type: 'ANNOUNCEMENT' },
        { title: 'dev-chat',      icon_file: fDevIcon._id, server: dev._id, room_type: 'TEXT' },
    ]);

    // Members
    const [aliceHub, bobHub, caraHub, aliceDev, bobDev] = await Member.create([
        { user: alice._id, server: hub._id, nickname: 'Alice', role: 'owner' },
        { user: bob._id,   server: hub._id, nickname: 'Bob',   role: 'member' },
        { user: cara._id,  server: hub._id, nickname: 'Cara',  role: 'member' },
        { user: alice._id, server: dev._id, nickname: 'Alice', role: 'member' },
        { user: bob._id,   server: dev._id, nickname: 'Bob',   role: 'moderator' },
    ]);

    // Messages & Attachments
    const m1 = await Message.create({
        sender: aliceHub._id,
        room: roomGeneral._id,
        content: 'Welcome to **General Hub**! 📌 Please check the announcement channel.',
        message_type: 'text',
    });

    const m2 = await Message.create({
        sender: bobHub._id,
        room: roomGeneral._id,
        reply_to: m1._id,
        content: 'Thanks @alice! I just uploaded the onboarding guide.',
        message_type: 'text',
    });

    await Attachment.create({
        message: m2._id,
        file: fWelcomeDoc._id,
        position: 1,
    });

    const dm1 = await Message.create({
        sender: aliceHub._id,
        recipients: [bobHub._id],
        content: 'Hey Bob, quick question about the API keys.',
        message_type: 'text',
    });

    const gdm1 = await Message.create({
        sender: bobHub._id,
        recipients: [aliceHub._id, caraHub._id],
        content: 'Team—design handoff at 3 PM. Can you both review the Figma?',
        message_type: 'text',
    });

    await Message.create({
        sender: bobDev._id,
        room: roomDevChat._id,
        content: 'Heads up: staging deploy at 17:00 UTC+7. Ping me if you see issues.',
        message_type: 'text',
    });

    console.log('Seed complete ✔');
}

async function InitializeDatabaseStructures() {
    
}

// Keep db_status accurate on connection state changes
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
    db_status = true;
    // check if there are any databse structures needed and create them if not
    ResetAndSeedSimple();
    InitializeDatabaseStructures();
});
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
    db_status = false;
    setTimeout(connectWithRetry, 50000);
});

const connectWithRetry = async () => {
    console.log('Trying to connect to MongoDB...');
    try {
        await mongoose.connect(mongoURL);
    } catch (err) {
        console.error('MongoDB connection error. Retrying in 50s...', err.message);
        setTimeout(connectWithRetry, 50000);
    }
};

// Start the HTTP server once
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

// Initialize DB connection (with retry)
connectWithRetry();