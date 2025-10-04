require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookiesParser = require('cookie-parser');
const Socket_Server = require("socket.io");
const http = require('http');

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true, // allow sending/receiving cookies
}));

app.use(express.json());
app.use(cookiesParser());

const chat_server = http.createServer(app);
const io = new Socket_Server.Server(chat_server, {
    cors: {
        origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },
});

// ---- DB CONNECT ----
const PORT = process.env.PORT || 3001;
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/kusa';
const RESET_SEEDED_DATA = process.env.RESET_SEEDED_DATA || 'false'; 

// Models
const { User, File, Server, Member, Room, Message, Attachment, Reaction, TimeSlot } = require('./schema.js');

// config (env)
const ACCESS_TTL  = process.env.ACCESS_TTL  || '1d';
const REFRESH_TTL = process.env.REFRESH_TTL || '90d';
const JWT_ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || 'dev-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

// Helpers
let db_status = false;
const oid = (id) => mongoose.Types.ObjectId.isValid(id);
const asInt = (v, d) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : d;
};

function isSelfOrAdmin(reqUserId, targetUserDoc) {
    if (!targetUserDoc) return false;
    if (targetUserDoc._id?.toString() === reqUserId) return true;
    return (targetUserDoc.role === 'ADMIN') ? false : (req.role === 'ADMIN');
}

// Auth middleware
function auth(req, res, next) {
    try {
        const token = req.cookies?.access_token;
        if (!token) {
            return res.status(401).json({ status: 'failed', message: 'Missing token' });
        }
        const { sub } = jwt.verify(token, JWT_ACCESS_SECRET); // payload = { sub }
        req.userId = sub; // store user id for handlers
        next();
    } catch {
        return res.status(401).json({ status: 'failed', message: 'Expired or invalid token' });
    }
}

// Health route
app.get('/', async (req, res) => {
    console.log("Health check received");
    let data = { backend: true, database: db_status };
    res.send(data);
});

const baseCookie = {
    httpOnly: true,                         // JS can’t read it (safer)
    sameSite: 'lax',                        // helps prevent CSRF; OK for SPA + API
    secure: false,                          // HTTPS required in prod
    path: '/',                              // available under root
};

function signAccess(payload) { return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL }); }
function signRefresh(payload) { return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL }); }

// ISO string for “now + ms”
function epochMsPlus(ms) { return new Date(Date.now() + ms).toISOString(); }

// Convert TTL to ms
function parseTtlToMs(ttl) {
    const m = /^(\d+)([smhd])$/.exec(ttl);
    if (!m) throw new Error('Invalid TTL format. Use like "15m", "2h", "7d".');
    const n = Number(m[1]); const unit = m[2];
    return n * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit]);
}

function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('access_token', accessToken, { ...baseCookie, maxAge: parseTtlToMs(ACCESS_TTL) });
    res.cookie('refresh_token', refreshToken, { ...baseCookie, maxAge: parseTtlToMs(REFRESH_TTL) });
}

// ==================== AUTH  =====================

// Register
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
            return res.status(409).json({ status: "failed", message: "This email has already been registered" });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ status: "failed", message: "This username is already taken" });
        }

        // Check if password and password confirmation match
        if (password != password_confirmation) {
            return res.status(400).json({ status: "failed", message: "Password and Confirm Password don't match" })
        }

        // Hash password
        const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, ROUNDS);

        // Create new user
        const newUser = new User({
            username: username,
            email: email,
            password_hash: hashedPassword
        });

        await newUser.save();
        return res.json({
                status: "success",
                message: "Registration Success",
                user: { id: newUser._id, email: newUser.email}
            });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "failed", message: "Unable to Register, please try again later" });
    }
});

// Change password
app.post('/api/v1/account/change-password', auth, async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        if (!old_password || !new_password) {
        return res.status(400).json({ status: "failed", message: "Missing fields" });
        }
        const user = await User.findById(req.userId).select('+password_hash');
        if (!user) return res.status(404).json({ status: "failed", message: "User not found" });

        const ok = await bcrypt.compare(old_password, user.password_hash);
        if (!ok) return res.status(401).json({ status: "failed", message: "Wrong current password" });

        if (new_password.length < 8) {
            return res.status(400).json({ status: "failed", message: "Password must be at least 8 characters" });
        }

        const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
        user.password_hash = await bcrypt.hash(new_password, ROUNDS);
        await user.save();

        return res.json({ status: "success", message: "Password updated" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ status: "failed", message: "Unable to change password" });
    }
});


// Login
app.post('/api/v1/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ status: "failed", message: "Email and password are required" });
        }
        // admin bypass remove before production
        if (email == "admin" && password == "admin") {
            return res.status(200).json({ status: "success", message: "Admin login successful", user: { username: "admin", role: "ADMIN" } });
        }

        // Find user by email
        const user = await User.findOne({ email }).select('+password_hash');

        // Check if user exists
        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: "failed", message: "Invalid email or password" });
        }

        // Create tokens
        const payload = { sub: user._id.toString() };

        const accessToken = signAccess(payload);               // 15m by default
        const refreshToken = signRefresh({ sub: payload.sub }); // 14d by default

        // Set Cookies
        setAuthCookies(res, accessToken, refreshToken);

        // Send Success Response with Tokens
        const safeUser = user.toObject();
        delete safeUser.password_hash;

        return res.status(200).json({
            status: "success",
            message: "Login successful",
            user: safeUser,
            session: {
                access_expires_at: epochMsPlus(parseTtlToMs(ACCESS_TTL)),
                refresh_expires_at: epochMsPlus(parseTtlToMs(REFRESH_TTL)),
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "failed", message: "Unable to login, please try again later" });
    }
});

// Who am I (protected)
app.get('/api/v1/auth/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('icon_file')
            .populate('banner_file')
            .populate({
            path: 'friends',
            select: '_id username icon_file',
            populate: { path: 'icon_file' }
            })
        if (!user) return res.status(404).json({ status: 'failed', message: 'User not found' });
        const userObject = user.toObject ? user.toObject() : user;
        
        // Explicitly remove password_hash and any other sensitive fields
        const { password_hash, __v, ...safeUserData } = userObject;
        return res.status(200).json({status: 'success', user: safeUserData});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'failed', message: 'Server error' });
    }
});

// Refresh access token from refresh cookie
app.post('/api/v1/auth/refresh', (req, res) => {
    try {
        const rt = req.cookies?.refresh_token;
        if (!rt) return res.status(401).json({ status: 'failed', message: 'No refresh token' });

        const { sub } = jwt.verify(rt, JWT_REFRESH_SECRET);
        const at = signAccess({ sub });
        res.cookie('access_token', at, { ...baseCookie, maxAge: parseTtlToMs(ACCESS_TTL) });
        res.json({ ok: true, access_expires_at: epochMsPlus(parseTtlToMs(ACCESS_TTL)) });
    } catch {
        return res.status(401).json({ status: 'failed', message: 'Invalid refresh token' });
    }
});

// Logout (clear cookies)
app.post('/api/v1/auth/logout', (_req, res) => {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.json({ ok: true });
});

// ===================== USER ======================

// Get user info
app.get('/api/v1/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!oid(id)) return res.status(400).json({ message: 'invalid user id' });

        const user = await User.findById(id)
        .populate('icon_file')
        .populate('banner_file')
        .lean();

        if (!user) return res.status(404).json({ message: 'user not found' });
        res.json({ status: 'success', user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'failed to fetch user' });
    }
});


// Edit user info (username, description, icon/banner)
app.patch('/api/v1/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!oid(id)) return res.status(400).json({ message: 'invalid user id' });

        const { username, description, icon_file, banner_file } = req.body;
        const update = {};

        if (typeof username === 'string' && username.trim()) {
        const exists = await User.findOne({ username, _id: { $ne: id } }).lean();
        if (exists) return res.status(409).json({ message: 'username already taken' });
        update.username = username.trim();
        }
        if (typeof description === 'string') update.description = description;

        if (icon_file) {
        if (!oid(icon_file)) return res.status(400).json({ message: 'invalid icon_file id' });
        const f = await File.findById(icon_file).lean();
        if (!f) return res.status(404).json({ message: 'icon file not found' });
        update.icon_file = icon_file;
        }
        if (banner_file) {
        if (!oid(banner_file)) return res.status(400).json({ message: 'invalid banner_file id' });
        const f = await File.findById(banner_file).lean();
        if (!f) return res.status(404).json({ message: 'banner file not found' });
        update.banner_file = banner_file;
        }

        if (!Object.keys(update).length)
        return res.status(400).json({ message: 'nothing to update' });

        const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
        .populate('icon_file')
        .populate('banner_file')
        .lean();

        if (!user) return res.status(404).json({ message: 'user not found' });
        res.json({ status: 'success', user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'failed to update user' });
    }
});

// ===================== USERS LIST ======================
// GET /api/v1/users?q=alice&page=1&limit=20&sort=-created_at
app.get('/api/v1/users', async (req, res) => {
    try {
        const q      = (req.query.q || '').trim();
        const page   = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit  = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
        const sort   = (req.query.sort || '-created_at'); // e.g. 'username' or '-created_at'

        const filter = {};
        if (q) {
        // case-insensitive search on username OR email
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ username: rx }, { email: rx }];
        }

        const cursor = User.find(filter)
        .select('+created_at +updated_at') // password_hash is already select:false
        .populate('icon_file')
        .populate('banner_file')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

        const [items, total] = await Promise.all([
        cursor,
        User.countDocuments(filter)
        ]);

        res.json({
        status: 'success',
        page,
        limit,
        total,
        has_more: page * limit < total,
        users: items
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'failed', message: 'failed to list users' });
    }
});

// DELETE /api/v1/users/:id
app.delete('/api/v1/users/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!oid(id)) return res.status(400).json({ message: 'invalid user id' });

        // Fetch target
        const target = await User.findById(id).lean();
        if (!target) return res.status(404).json({ message: 'user not found' });

        // Optional: if you store user role in token, decode earlier and set req.role.
        // For now, allow only self-delete.
        if (req.userId !== id) {
        return res.status(403).json({ message: 'forbidden: can only delete your own account' });
        }

        await User.deleteOne({ _id: id });
        // If you want "soft delete", flip a flag instead of deleting.

        // Clear cookies if the user deleted themself
        if (req.userId === id) {
        res.clearCookie('access_token',  { path: '/api/v1' });
        res.clearCookie('refresh_token', { path: '/api/v1' });
        }

        res.json({ status: 'success', deleted_id: id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'failed', message: 'failed to delete user' });
    }
});

// ====================== Messages =====================
// GET /api/v1/chats/68de76d6f1ffd6673b748b5e/messages?page=1&limit=20
app.get('/api/v1/chats/:userId/messages', auth, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.userId;
        
        // Pagination
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
        
        // Sort direction
        const sortDir = req.query.sort === 'desc' ? -1 : 1; // Default: newest first

        // Find all member IDs for both users
        const currentUserMembers = await Member.find({ user: currentUserId }).select('_id');
        const otherUserMembers = await Member.find({ user: otherUserId }).select('_id');
        
        const currentUserMemberIds = currentUserMembers.map(m => m._id);
        const otherUserMemberIds = otherUserMembers.map(m => m._id);

        // Find direct messages between the two users
        const messages = await Message.find({
            context_type: 'User',
            $or: [
                // Messages from current user to other user
                { 
                    context: otherUserId,
                    sender: { $in: currentUserMemberIds }
                },
                // Messages from other user to current user
                { 
                    context: currentUserId,
                    sender: { $in: otherUserMemberIds }
                }
            ]
        })
        .populate({
            path: 'sender',
            populate: {
                path: 'user',
                select: 'username display_name icon_file',
                populate: {
                    path: 'icon_file'
                }
            }
        })
        .populate({
            path: 'recipients',
            populate: {
                path: 'user',
                select: 'username display_name'
            }
        })
        .populate('reply_to')
        .populate({
            path: 'context',
            select: 'username display_name icon_file',
            populate: {
                path: 'icon_file'
            }
        })
        .sort({ created_at: sortDir })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

        // Get total count for pagination
        const total = await Message.countDocuments({
            context_type: 'User',
            $or: [
                { 
                    context: otherUserId,
                    sender: { $in: currentUserMemberIds }
                },
                { 
                    context: currentUserId,
                    sender: { $in: otherUserMemberIds }
                }
            ]
        });

        res.json({
            status: 'success',
            page,
            limit,
            total,
            has_more: page * limit < total,
            messages: messages
        });

    } catch (error) {
        console.error('Error fetching user chat:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to fetch chat messages' });
    }
});

// POST /api/v1/chats/:userId/messages
app.post('/api/v1/chats/:userId/messages', auth, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.userId;
        const { content, message_type = 'text' } = req.body;

        // Get current user's member IDs
        const currentUserMembers = await Member.find({ user: currentUserId });
        if (currentUserMembers.length === 0) {
            return res.status(404).json({ status: 'failed', message: 'Member record not found' });
        }

        // Get other user's member IDs for recipients
        const otherUserMembers = await Member.find({ user: otherUserId });
        const otherUserMemberIds = otherUserMembers.map(m => m._id);

        // Create the message
        const message = await Message.create({
            sender: currentUserMembers[0]._id, // Use first member record
            recipients: otherUserMemberIds,
            context: otherUserId,
            context_type: 'User',
            content,
            message_type
        });

        // Populate and return the created message
        const populatedMessage = await Message.findById(message._id)
            .populate({
                path: 'sender',
                populate: {
                    path: 'user',
                    select: 'username display_name icon_file'
                }
            })
            .populate('recipients')
            .lean();

        res.json({
            status: 'success',
            message: populatedMessage
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to send message' });
    }
});

// --- SOCKET LOGIC ---
io.on("connection", (socket) => {
console.log("✅ New WebSocket connection:", socket.id);

// Join room per user ID (from query or handshake)
const userId = socket.handshake.query.userId;
if (userId) socket.join(userId);

// Listen for "send_message" event from client
socket.on("send_message", async (msgData) => {
    try {
    const { fromUserId, toUserId, content, message_type = "text" } = msgData;

    // 💾 Save message in DB using your existing logic
    const currentUserMembers = await Member.find({ user: fromUserId });
    const otherUserMembers = await Member.find({ user: toUserId });
    const otherUserMemberIds = otherUserMembers.map((m) => m._id);

    const message = await Message.create({
        sender: currentUserMembers[0]._id,
        recipients: otherUserMemberIds,
        context: toUserId,
        context_type: "User",
        content,
        message_type,
    });

    const populatedMessage = await Message.findById(message._id)
        .populate({
        path: "sender",
        populate: {
            path: "user",
            select: "username display_name icon_file",
        },
        })
        .populate("recipients")
        .lean();

        // Emit the message to both sender and recipient
        io.to(fromUserId).emit("receive_message", populatedMessage);
        io.to(toUserId).emit("receive_message", populatedMessage);

        console.log("📨 Message delivered via WS:", content);
        } catch (err) {
        console.error("Socket message error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ WebSocket disconnected:", socket.id);
    });
});


async function InitializeDatabaseStructures() {
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
        { room: { $in: seedRoomIds } },
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
        { username: 'alice', email: 'alice@example.com', password_hash: aliceHash, icon_file: fAliceAva._id, role: 'USER', description: 'Product manager' },
        { username: 'bob', email: 'bob@example.com', password_hash: bobHash, icon_file: fBobAva._id, role: 'USER', description: 'Backend dev' },
        { username: 'cara', email: 'cara@example.com', password_hash: caraHash, icon_file: fCaraAva._id, role: 'USER', description: 'Designer' },
        // { username: 'admin', email: 'admin@example.com', password_hash: adminHash, icon_file: fCaraAva._id, role: 'USER', description: 'Designer' },
    ]);

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

// Keep db_status accurate on connection state changes
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
    db_status = true;
    // check if there are any databse structures needed and create them if not
    if (RESET_SEEDED_DATA == 'true') {
        console.log('Resetting and seeding database structures...');
        // drop all collections (if exist)
        mongoose.connection.db.dropDatabase().then(() => {
            console.log('Database dropped');
            InitializeDatabaseStructures();
        }).catch(err => {console.error('Error dropping database:', err);});
    } else {
        console.log('Skipping database seed/reset.');
    }

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

// Start the combined server (handles both HTTP + WS)
chat_server.listen(PORT, () => console.log(`🚀 Backend + WS running on port ${PORT}`));

// Initialize DB connection (with retry)
connectWithRetry();