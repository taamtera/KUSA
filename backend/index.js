require('dotenv').config();
const InitializeDatabaseStructures = require('./seedDatabase');
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

app.patch('/api/v1/auth/me', auth, async (req, res) => {
    try {
        // 	username: data.user.username || "",
        // 	faculty: data.user.faculty || "",
        // 	major: data.user.major || "",
        // 	pronouns: data.user.pronouns || "",
        // 	birthday: data.user.birthday || "",
        // 	phone: data.user.phone || "",
        // 	email: data.user.email || "",
        // 	bio: data.user.bio || "",
        const fields = ['username', 'faculty', 'major', 'pronouns', 'birthday', 'phone', 'email', 'bio'];
        const updates = {};
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'no valid fields to update' });
        }        
        console.log("Updating user:", req.userId, updates);
        const result = await User.updateOne({ _id: req.userId }, updates);
        console.log("Update result:", result);
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'user not found' });
        }
        res.json({ status: 'success', message: 'user updated' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'failed to update user' });
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
// Get paginated and sorted messages in a DM with another user
app.get('/api/v1/chats/dms/:userId/messages', auth, async (req, res) => {
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

// Get paginated and sorted messages in a room
app.get('/api/v1/chats/rooms/:roomId/messages', auth, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const currentUserId = req.userId;

        // Pagination
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);

        // Sort direction
        const sortDir = req.query.sort === 'asc' ? 1 : -1; // Default: newest first

        // Find all member IDs for the current user (to verify membership)
        const userMembers = await Member.find({ user: currentUserId }).select('_id server');

        // Check that user is a member of the server this room belongs to
        const room = await Room.findById(roomId).populate('server');
        if (!room) {
            return res.status(404).json({ status: 'failed', message: 'Room not found' });
        }

        const userMember = userMembers.find(m => m.server.equals(room.server._id));
        if (!userMember) {
            return res.status(403).json({ status: 'failed', message: 'Not a member of this room\'s server' });
        }

        // Fetch messages in this room
        const messages = await Message.find({
            context_type: 'Room',
            context: roomId
        })
        .populate({
            path: 'sender',
            populate: {
                path: 'user',
                select: 'username display_name icon_file',
                populate: { path: 'icon_file' }
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
            select: 'title server',
            populate: {
                path: 'server',
                select: 'server_name icon_file',
                populate: { path: 'icon_file' }
            }
        })
        .sort({ created_at: sortDir })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

        // Add server data
        const server = await Server.findById(room.server._id)
        const roomName = room.title;

        // Count total messages in this room
        const total = await Message.countDocuments({
            context_type: 'Room',
            context: roomId
        });

        res.json({
            status: 'success',
            page,
            limit,
            total,
            has_more: page * limit < total,
            server,
            roomName,
            messages
        });
    } catch (error) {
        console.error('Error fetching room chat:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to fetch room messages' });
    }
});

// ====================== Servers =====================

// List servers (that the user is a member of)
app.get('/api/v1/servers', auth, async (req, res) => {
    try {

        // Find member records for the user
        const memberRecords = await Member.find({ user: req.userId }).select('_id server');

        const memberServerIds = memberRecords.map(m => m.server);

        // Find servers where the user is a member
        const servers = await Server.find({ _id: { $in: memberServerIds } })
            .populate('icon_file')
            .lean();

        // find rooms for each server
        for (let server of servers) {
            const rooms = await Room.find({ server: server._id })
                .lean();
            server.rooms = rooms;
        }

        res.json({
            status: 'success',
            servers
        });

    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to fetch servers' });
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

mongoose.connection.on("connected", () => {
    console.log("MongoDB connected")
    db_status = true

    if (RESET_SEEDED_DATA === "true") {
        console.log("Resetting and seeding database structures...")
        mongoose.connection.db
            .dropDatabase()
            .then(() => {
                console.log("Database dropped")
                InitializeDatabaseStructures(RESET_SEEDED_DATA)
            })
            .catch((err) => console.error("Error dropping database:", err))
    } else {
        console.log("Skipping database seed/reset.")
    }
})

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