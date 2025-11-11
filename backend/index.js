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
const RESET_SEEDED_DATA = process.env.RESET_SEEDED_DATA || 'true';

// Models
const { User, File, Server, Member, Room, Message, Attachment, Reaction, TimeSlot, Notification } = require('./schema.js');
const path = require('path');

// config (env)
const ACCESS_TTL = process.env.ACCESS_TTL || '1d';
const REFRESH_TTL = process.env.REFRESH_TTL || '90d';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

// Helpers
let db_status = false;
const oid = (id) => mongoose.Types.ObjectId.isValid(id);
const asInt = (v, d) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : d;
};

const norm = v => (typeof v === 'string' && v.trim() === '' ? null : v);

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

// optionalAuth middleware, ignore bad/missing token; treat as anonymous
function optionalAuth(req, res, next) {
    try {
        const token = req.cookies?.access_token;
        if (!token) return next();
        const { sub } = jwt.verify(token, JWT_ACCESS_SECRET);
        req.userId = sub;
        next();
    } catch {
        next();
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

// Time table helpers
const DAY_ENUM = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// Overlap check helper: returns true if new [s,e) overlaps any existing range
function overlaps(aStart, aEnd, bStart, bEnd) {
    return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

// ==================== AUTH  =====================

// Register
app.post('/api/v1/login/register', async (req, res) => {
    try {
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
            user: { id: newUser._id, email: newUser.email }
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
        return res.status(200).json({ status: 'success', user: safeUserData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'failed', message: 'Server error' });
    }
});

app.patch('/api/v1/auth/me', auth, async (req, res) => {
    try {
        const fields = ['username', 'faculty', 'major', 'pronouns', 'birthday', 'phone', 'email', 'bio'];

        // 1) reject unexpected fields
        const unknown = Object.keys(req.body).filter(k => !fields.includes(k));
        if (unknown.length > 0) {
            return res.status(400).json({ message: 'invalid fields', invalid_fields: unknown });
        }

        // 2) collect updates
        const updates = {};
        fields.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'no valid fields to update' });
        }

        // 3) coerce/validate some values
        if ('birthday' in updates) {
            if (updates.birthday === '' || updates.birthday === null) {
                updates.birthday = null;
            } else {
                const d = new Date(updates.birthday);
                if (isNaN(d.getTime())) return res.status(400).json({ message: 'invalid birthday' });
                updates.birthday = d;
            }
        }
        // Normalize empty strings to null for optional text fields (so schema defaults/nulls behave)
        ['faculty', 'major', 'pronouns', 'phone', 'bio'].forEach(f => {
            if (f in updates && updates[f] === '') updates[f] = null;
        });

        // 4) apply update with validation and get back the updated doc
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true, runValidators: true, context: 'query' }
        )
            .populate('icon_file')
            .populate('banner_file')
            .lean();

        if (!updatedUser) return res.status(404).json({ message: 'user not found' });

        const { password_hash, __v, ...safeUser } = updatedUser;
        res.json({ status: 'success', user: safeUser });
    } catch (e) {
        // Mongoose validation errors
        if (e.name === 'ValidationError') {
            const errors = Object.keys(e.errors).map(k => ({ field: k, message: e.errors[k].message }));
            return res.status(400).json({ message: 'validation failed', errors });
        }
        // duplicate key (unique) error
        if (e.code === 11000) {
            const field = Object.keys(e.keyPattern || e.keyValue || {})[0];
            return res.status(409).json({ message: 'duplicate value', field });
        }
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
        const q = (req.query.q || '').trim();
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
        const sort = (req.query.sort || '-created_at'); // e.g. 'username' or '-created_at'

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
            res.clearCookie('access_token', { path: '/' });
            res.clearCookie('refresh_token', { path: '/' });
        }

        res.json({ status: 'success', deleted_id: id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'failed', message: 'failed to delete user' });
    }
});

// ===================== Time Table ====================
// Create a time slot for the current user
app.post('/api/v1/timetable', auth, async (req, res) => {
    try {
        // 1) coerce numbers up front
        const title = req.body.title;
        const description = norm(req.body.description);
        const dayRaw = req.body.day;
        const start = asInt(req.body.start_min, -1);
        const end = asInt(req.body.end_min, -1);
        const location = norm(req.body.location);
        const color = norm(req.body.color);

        // 2) normalize/validate
        const day = (typeof dayRaw === 'string') ? dayRaw.toLowerCase() : dayRaw;
        if (!title || !day || start === -1 || end === -1) {
            return res.status(400).json({ status: 'failed', message: 'title, day, start_min, end_min are required' });
        }
        if (!DAY_ENUM.includes(day)) {
            return res.status(400).json({ status: 'failed', message: 'invalid day' });
        }
        if (start < 0 || start > 1439 || end < 1 || end > 1440 || start >= end) {
            return res.status(400).json({ status: 'failed', message: 'invalid time range' });
        }

        // 3) Mongo-side overlap check (faster than pulling all)
        const clash = await TimeSlot.findOne({
            owner: req.userId,
            day,
            start_min: { $lt: end },
            end_min: { $gt: start },
        }).lean();

        if (clash) {
            return res.status(409).json({
                status: 'failed',
                message: `overlaps with "${clash.title}" (${clash.start_min}-${clash.end_min})`
            });
        }

        // 4) Create
        const slot = await TimeSlot.create({
            owner: req.userId,
            title,
            description,
            day,
            start_min: start,
            end_min: end,
            location,
            color,
        });

        return res.status(201).json({ status: 'success', slot });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'failed', message: 'failed to create slot' });
    }
});

// GET timetable
app.get('/api/v1/users/:userId/timetable', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        let { day } = req.query;

        if (!oid(userId)) return res.status(400).json({ status: 'failed', message: 'invalid user id' });

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ status: 'failed', message: 'user not found' });

        const isOwner = req.userId?.toString() === userId.toString();

        if (!isOwner && user.timetable_visibility !== 'public') {
            return res.status(403).json({ status: 'failed', message: 'this timetable is private' });
        }

        // normalize/validate day
        if (typeof day === 'string') day = day.toLowerCase();
        if (day && !DAY_ENUM.includes(day)) {
            return res.status(400).json({ status: 'failed', message: 'invalid day' });
        }

        const filter = { owner: userId };
        if (day) filter.day = day;

        const PUBLIC_FIELDS = 'title day start_min end_min location color';
        const projection = isOwner ? undefined : PUBLIC_FIELDS;

        // temporary sort: by day order + start_min (see §2 for stable day-order)
        const slots = await TimeSlot.find(filter)
            .select(projection)
            .sort({ start_min: 1 }) // we'll reorder by day below
            .lean();

        // reorder by semantic day order
        const dayIndex = d => ({ mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 })[d];
        slots.sort((a, b) => (dayIndex(a.day) - dayIndex(b.day)) || (a.start_min - b.start_min));

        res.json({
            status: 'success',
            owner: { _id: user._id, username: user.username, visibility: user.timetable_visibility },
            slots
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'failed', message: 'failed to fetch timetable' });
    }
});

// Update a slot I own
app.patch('/api/v1/timetable/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!oid(id)) return res.status(400).json({ status: 'failed', message: 'invalid id' });

        const slot = await TimeSlot.findOne({ _id: id, owner: req.userId });
        if (!slot) return res.status(404).json({ status: 'failed', message: 'slot not found' });

        // 1) apply updates (coerce and normalize)
        if ('title' in req.body) slot.title = req.body.title;
        if ('description' in req.body) slot.description = norm(req.body.description);
        if ('location' in req.body) slot.location = norm(req.body.location);
        if ('color' in req.body) slot.color = norm(req.body.color);
        if ('day' in req.body) slot.day = (typeof req.body.day === 'string') ? req.body.day.toLowerCase() : req.body.day;
        if ('start_min' in req.body) slot.start_min = asInt(req.body.start_min, slot.start_min);
        if ('end_min' in req.body) slot.end_min = asInt(req.body.end_min, slot.end_min);

        // 2) validate
        if (!DAY_ENUM.includes(slot.day)) {
            return res.status(400).json({ status: 'failed', message: 'invalid day' });
        }
        if (slot.start_min < 0 || slot.start_min > 1440 || slot.end_min < 0 || slot.end_min > 1440 || slot.end_min <= slot.start_min) {
            return res.status(400).json({ status: 'failed', message: 'invalid time range' });
        }

        // 3) Mongo-side overlap check (exclude self)
        const clash = await TimeSlot.findOne({
            owner: req.userId,
            day: slot.day,
            _id: { $ne: slot._id },
            start_min: { $lt: slot.end_min },
            end_min: { $gt: slot.start_min },
        }).lean();

        if (clash) {
            return res.status(409).json({
                status: 'failed',
                message: `overlaps with "${clash.title}" (${clash.start_min}–${clash.end_min})`
            });
        }

        // 4) save
        await slot.save();
        res.json({ status: 'success', slot });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'failed', message: 'failed to update slot' });
    }
});

// Delete a slot I own
app.delete('/api/v1/timetable/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!oid(id)) return res.status(400).json({ status: 'failed', message: 'invalid id' });
        const slot = await TimeSlot.findOneAndDelete({ _id: id, owner: req.userId });
        if (!slot) return res.status(404).json({ status: 'failed', message: 'slot not found' });

        res.json({ status: 'success', deleted_id: id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'failed', message: 'failed to delete slot' });
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
            .populate({
                path: 'reply_to',
                populate: [
                    {
                        path: 'sender',
                        populate: { path: 'user', select: 'username display_name icon_file', populate: { path: 'icon_file' } }
                    },
                    { path: 'recipients', populate: { path: 'user', select: 'username display_name' } }
                ]
            })
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
        const sortDir = req.query.sort === 'desc' ? -1 : 1; // Default: newest first

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

        // add members of the room's server
        const members = await Member.find({ server: room.server._id })
            .populate({
                path: 'user',
                select: 'username display_name icon_file',
                populate: { path: 'icon_file' }
            })
            .lean();

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
            messages,
            members
        });
    } catch (error) {
        console.error('Error fetching room chat:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to fetch room messages' });
    }
});

// Edit message
app.patch("/api/v1/messages/:id", auth, async (req, res) => {
    try {
        const id = req.params.id.trim();
        const { content } = req.body;

        console.log("PATCH body:", req.body);

        // --- Validate ID ---
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ status: "failed", message: "Invalid message ID" });
        }

        // --- Validate content ---
        if (!content || !content.trim()) {
            return res.status(400).json({ status: "failed", message: "Empty content" });
        }

        // --- Find message and populate sender info ---
        let msg = await Message.findById(id)
            .populate({
                path: "sender",
                populate: { path: "user", select: "_id username" },
            });

        if (!msg) {
            return res.status(404).json({ status: "failed", message: "Message not found" });
        }

        // --- Populate context safely ---
        if (msg.context_type === "Room") {
            await msg.populate({ path: "context", populate: { path: "server" } });
        } else {
            await msg.populate("context");
        }

        // --- Permission checks ---
        const senderUserId = msg.sender.user._id.toString();
        const currentUserId = req.userId.toString();
        let canEdit = false;

        if (msg.context_type === "User") {
            // Direct message: only sender can edit
            canEdit = senderUserId === currentUserId;
        } else if (msg.context_type === "Room") {
            // Room: sender, owner, or moderator can edit
            const member = await Member.findOne({
                user: currentUserId,
                server: msg.context.server,
            });

            if (member && ["owner", "moderator"].includes(member.role)) canEdit = true;
            if (senderUserId === currentUserId) canEdit = true;
        }

        if (!canEdit) {
            return res.status(403).json({
                status: "failed",
                message: "You do not have permission to edit this message",
            });
        }

        // --- Update the message ---
        msg.content = content.trim();
        msg.edited_count += 1;
        msg.edited_at = new Date();

        await msg.save();

        // --- Optional WebSocket broadcast ---
        /*
        if (io) {
          if (msg.context_type === "User") {
            io.to(msg.sender.user._id.toString()).emit("message_edited", msg);
            io.to(msg.context._id.toString()).emit("message_edited", msg);
          } else if (msg.context_type === "Room") {
            io.to(msg.context._id.toString()).emit("message_edited", msg);
          }
        }
        */

        return res.json({ status: "success", message: msg });
    } catch (err) {
        console.error("Edit message error:", err);
        return res.status(500).json({
            status: "failed",
            message: "Failed to edit message",
            error: err.message,
        });
    }
});


// ====================== Servers =====================

// CREATE SERVER
app.post('/api/v1/servers/create', auth, async (req, res) => {
    try {
        const { serverName } = req.body;
        const userId = req.userId;

        if (!serverName || !userId) {
            return res.status(400).json({ message: 'Missing serverName or userId.' });
        }

        // ✅ 1. Create server
        const newServer = await Server.create({
            server_name: serverName,
            icon_file: null,
            banned_users: []
        });

        // ✅ 2. Add creator as owner
        const ownerMember = await Member.create({
            user: userId,
            server: newServer._id,
            role: 'OWNER'
        });

        // ✅ 3. Create first/default room
        const generalRoom = await Room.create({
            server: newServer._id,
            title: "general",
            order: 0
        });

        return res.status(201).json({
            message: "Server created successfully!",
            server: newServer,
            owner: ownerMember,
            firstRoomId: generalRoom._id
        });

    } catch (error) {
        console.error("Error creating server:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

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
            // Ensure rooms are returned in the defined "order" field
            const rooms = await Room.find({ server: server._id })
                .sort({ order: 1 })
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

// Get server by Id
app.get('/api/v1/servers/:serverId', auth, async (req, res) => {
    try {
        const { serverId } = req.params;
        const server = await Server.findById(serverId);

        if (!server) {
            return res.status(404).json({ message: "Server not found." });
        }

        return res.status(200).json({ server });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
});


// Generate server invite link (which is just href={`/join/${server._id}`})
app.post('/api/v1/servers/:serverId/invite', auth, async (req, res) => {
    try {
        const { serverId } = req.params;
        // Check if the user is a member of the server
        const isMember = await Member.findOne({ server: serverId, user: req.userId });
        console.log(isMember);
        if (!isMember) {
            return res.status(403).json({ status: 'failed', message: 'You are not a member of this server' });
        }
        // For simplicity, the invite link is just the server ID.
        const inviteLink = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/join/${serverId}`;
        res.json({ status: 'success', invite_link: inviteLink });
    } catch (error) {
        console.error('Error generating invite link:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to generate invite link' });
    }
});

// Join server
app.post('/api/v1/servers/join', auth, async (req, res) => {
    try {
        const { serverId } = req.body;
        const userId = req.userId;

        if (!userId || !serverId) {
            return res.status(400).json({ message: 'Missing userId or serverId.' });
        }

        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({ message: 'Server not found.' });
        }

        // Check membership
        let member = await Member.findOne({ user: userId, server: serverId });
        if (!member) {
            member = await Member.create({
                user: userId,
                server: serverId,
                role: 'MEMBER'
            });
        }

        // Get first room
        const firstRoom = await Room.findOne({ server: serverId }).sort({ order: 1 });

        return res.status(200).json({
            message: "Success",
            member,
            firstRoomId: firstRoom ? firstRoom._id : null
        });

    } catch (error) {
        console.error('Error joining server:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// DELETE SERVER
app.delete('/api/v1/servers/:serverId', auth, async (req, res) => {
    try {
        const { serverId } = req.params;
        const userId = req.userId;

        if (!oid(serverId)) {
            return res.status(400).json({ status: 'failed', message: 'Invalid server id' });
        }

        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({ status: 'failed', message: 'Server not found' });
        }

        const ownerRecord = await Member.findOne({ server: serverId, user: userId, role: 'OWNER' });
        if (!ownerRecord) {
            return res.status(403).json({ status: 'failed', message: 'Only server owner can delete server' });
        }

        const rooms = await Room.find({ server: serverId }, '_id');
        const roomIds = rooms.map(r => r._id);

        const messages = await Message.find({
            context_type: 'Room',
            context: { $in: roomIds }
        }, '_id');

        const messageIds = messages.map(m => m._id);

        await Reaction.deleteMany({ message: { $in: messageIds } });

        const attachments = await Attachment.find({ message: { $in: messageIds } });

        for (const att of attachments) {
            const fileDoc = await File.findById(att.file);
            if (fileDoc) {
                await File.deleteOne({ _id: fileDoc._id });
            }
        }

        await Attachment.deleteMany({ message: { $in: messageIds } });
        await Message.deleteMany({ _id: { $in: messageIds } });
        await Room.deleteMany({ server: serverId });
        await Member.deleteMany({ server: serverId });

        if (server.icon_file) {
            await File.deleteOne({ _id: server.icon_file });
        }

        await Server.deleteOne({ _id: serverId });

        return res.json({
            status: 'success',
            message: 'Server and all related data deleted',
            deletedServerId: serverId
        });

    } catch (err) {
        console.error("Error deleting server:", err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error' });
    }
});

// ====================== Rooms =====================

// Add a room to a server
app.post('/api/v1/rooms', auth, async (req, res) => {
    try {
        const { serverId, title } = req.body;

        if (!serverId || !title) {
            return res.status(400).json({ status: 'failed', message: 'Server ID and room title are required' });
        }

        const isPermission = await Member.findOne({
            server: serverId,
            user: req.userId,
            role: { $in: ['OWNER', 'MODERATOR'] }
        });

        if (!isPermission) {
            return res.status(403).json({ status: 'failed', message: 'You do not have permission to edit this room' });
        }

        const last_room_order = await Room.countDocuments({ server: serverId });

        const room = await Room.create({
            server: serverId,
            title,
            order: last_room_order,
            createdBy: req.userId
        });

        res.status(201).json({ status: 'success', room });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to create room' });
    }
});

// Edit room
app.patch('/api/v1/rooms/:roomId', auth, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { title, order } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ status: 'failed', message: 'Room not found' });
        }

        const isPermission = await Member.findOne({
            server: room.server,
            user: req.userId,
            role: { $in: ['OWNER', 'MODERATOR'] }
        });

        if (!isPermission) {
            return res.status(403).json({ status: 'failed', message: 'You do not have permission to edit this room' });
        }

        if (order !== undefined) {
            const old_index = room.order;
            const new_index = order;

            await Room.updateMany(
                { server: room.server, order: { $gt: old_index } },
                { $inc: { order: -1 } }
            );
            await Room.updateMany(
                { server: room.server, order: { $gte: new_index } },
                { $inc: { order: 1 } }
            );
            room.order = new_index;
        }

        if (title !== undefined) room.title = title;
        await room.save();

        res.json({ status: 'success', room });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to update room' });
    }
});

// Delete room
app.delete('/api/v1/rooms/:roomId', auth, async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ status: 'failed', message: 'Room not found' });
        }

        const isPermission = await Member.findOne({
            server: room.server,
            user: req.userId,
            role: { $in: ['OWNER', 'MODERATOR'] }
        });

        if (!isPermission) {
            return res.status(403).json({ status: 'failed', message: 'You do not have permission to delete this room' });
        }

        const deletedRoomOrder = room.order;
        await Room.deleteOne({ _id: room._id });

        await Room.updateMany(
            { server: room.server, order: { $gt: deletedRoomOrder } },
            { $inc: { order: -1 } }
        );

        res.json({ status: 'success', message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to delete room' });
    }
});

// ====================== Direct Messages =====================

// POST /api/v1/chats/:userId/messages
// Send a direct message to another user
app.post('/api/v1/chats/:userId/messages', auth, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.userId;
        const { content, message_type = 'text', reply_to = null } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ status: 'failed', message: 'Message content cannot be empty' });
        }
        const senderMemberId = currentUserMembers[0]._id; // Use first member record

        // Get current user's member IDs
        const currentUserMembers = await Member.find({ user: currentUserId });
        if (currentUserMembers.length === 0) {
            return res.status(404).json({ status: 'failed', message: 'Member record not found' });
        }

        // Get other user's member IDs for recipients
        const otherUserMembers = await Member.find({ user: otherUserId });
        const otherUserMemberIds = otherUserMembers.map(m => m._id);

        // If replying, validate the parent message belongs to this chat
        let parent = null;
        if (reply_to) {
            parent = await Message.findById(reply_to).lean();
            if (!parent) {
                return res.status(404).json({ status: 'failed', message: 'Parent message not found' });
            }
            // Must be DM thread
            if (parent.context_type !== 'User') {
                return res.status(400).json({ status: 'failed', message: 'Cannot reply to non-DM message in this route' });
            }
            // Parent must be between these two users
            const parentBetweenSamePair = (
                (String(parent.context) === String(otherUserId)) ||
                (String(parent.context) === String(currentUserId))
            );
            if (!parentBetweenSamePair) {
                return res.status(403).json({ status: 'failed', message: 'Parent message not in this chat' });
            }
        }

        // Create the message
        const message = await Message.create({
            sender: senderMemberId,
            recipients: otherUserMemberIds,
            context: otherUserId,
            context_type: 'User',
            content: content.trim(),
            message_type,
            reply_to: reply_to || undefined,
        });

        // Populate and return the created message
        const populatedMessage = await Message.findById(message._id)
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
            .populate({
                path: 'reply_to',
                populate: [
                    {
                        path: 'sender',
                        populate: { path: 'user', select: 'username display_name icon_file', populate: { path: 'icon_file' } }
                    },
                    { path: 'recipients', populate: { path: 'user', select: 'username display_name' } }
                ]
            })
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

// GET /api/v1/messages/:id/replies?page=1&limit=20&sort=asc|desc
// Get replies to a specific message (only for DMs)
app.get('/api/v1/messages/:id/replies', auth, async (req, res) => {
    try {
        const parentId = req.params.id;
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
        const sortDir = req.query.sort === 'asc' ? 1 : -1;

        // optional: ensure requester participates in the parent DM
        const parent = await Message.findById(parentId).lean();
        if (!parent) return res.status(404).json({ status: 'failed', message: 'parent message not found' });
        if (parent.context_type !== 'User') {
            return res.status(400).json({ status: 'failed', message: 'only supports DM replies' });
        }
        // Very light permission: the requester must be either the DM peer (context == me or otherUser)
        const me = req.userId;
        if (String(parent.context) !== String(me) && String(parent.context) !== String(await Message.findById(parentId).distinct('recipients.user'))) {
            // If you need stricter checks, expand this to confirm the pair is {me, otherUser}
        }

        const replies = await Message.find({ reply_to: parentId })
            .sort({ created_at: sortDir })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: 'sender',
                populate: { path: 'user', select: 'username display_name icon_file', populate: { path: 'icon_file' } }
            })
            .populate({ path: 'recipients', populate: { path: 'user', select: 'username display_name' } })
            .lean();

        const total = await Message.countDocuments({ reply_to: parentId });

        res.json({
            status: 'success',
            page,
            limit,
            total,
            has_more: page * limit < total,
            replies
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'failed', message: 'failed to fetch replies' });
    }
});

// ====================== Notifications ======================
// const notificationSchema = new Schema({
//     user: { type: ObjectId, ref: 'User', required: true },
//     type: { enum: ['MENTION', 'FRIEND_REQUEST'], type: String, required: true },
//     location: { type: ObjectId, ref: 'Message' },
//     from: { type: ObjectId, ref: 'User', required: true },
// });

app.get('/api/v1/notifications', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.userId })
            .populate({ path: "from", select: "username display_name icon_file", populate: { path: 'icon_file' }})
            .populate('location')
            .sort({ created_at: -1 })
            .lean();

        res.json({ status: 'success', notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to fetch notifications' });
    }
});

app.post('/api/v1/notification/respond', auth, async (req, res) => {
    try {
        const { notificationId, accept } = req.body;
        if (accept) {
            const result = await Notification.deleteOne({ _id: notificationId });
            if (result.deletedCount === 0) {
                return res.status(404).json({ status: 'failed', message: 'Notification not found' });
            }
            return res.json({ status: 'success', message: 'Notification accepted and deleted' });
        }
    } catch (error) {
        console.error('Error responding to notification:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to respond to notification' });   
    }
});

// ====================== Friends ======================
// const notificationSchema = new Schema({
//     user: { type: ObjectId, ref: 'User', required: true },
//     type: { enum: ['MENTION', 'FRIEND_REQUEST'], type: String, required: true },
//     location: { type: ObjectId, ref: 'Message' },
//     from: { type: ObjectId, ref: 'User', required: true },
// });
app.post('/api/v1/friend/add', auth, async (req, res) => {
    try {
        const { toUsername } = req.body;

        // check if user exist
        const recipient = await User.findOne({ username: toUsername }).lean();
        if (!toUsername || !recipient) return res.status(404).json({ status: 'failed', message: 'User not found' });

        // Prevent sending a request to yourself
        if (recipient._id.toString() === req.userId.toString()) {
        return res.status(400).json({ status: 'failed', message: 'You cannot add yourself as a friend' });
        }

        // Prevent sending a request if already friends
        if (recipient.friends?.some(id => id.toString() === req.userId.toString())) {
        return res.status(400).json({ status: 'failed', message: 'User is already your friend' });
        }

        //P revent duplicate friend requests
        const friendRequest = await Notification.findOne({ user: recipient._id, type: 'FRIEND_REQUEST', from: req.userId });
        if (friendRequest) return res.status(200).json({ status: 'success', message: 'Friend request already sent' });
        

        const newFriendRequest = await Notification.create({ user: recipient._id, type: 'FRIEND_REQUEST', from: req.userId });
        res.status(201).json({ status: 'success', message: 'Friend request sent', data: newFriendRequest });

    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to send friend request' });
    }
});

app.post('/api/v1/friend/respond', auth, async (req, res) => {
    try {
        const { notificationId, accept } = req.body;
        const notification = await Notification.findById(notificationId);
        if (!notification) return res.status(404).json({ status: 'failed', message: 'Notification not found' });
        
        if (notification.type === 'FRIEND_REQUEST' && String(notification.user) === String(req.userId)) {
            if (accept) {
                await User.updateOne(
                    { _id: req.userId },
                    { $addToSet: { friends: notification.from } }
                );
                await User.updateOne(
                    { _id: notification.from },
                    { $addToSet: { friends: req.userId } }
                );
                await Notification.deleteOne({ _id: notificationId });

                return res.json({ status: 'success', message: 'Friend request accepted' });

            } else {
                // Decline: just delete the notification
                await Notification.deleteOne({ _id: notificationId });
                return res.json({ status: 'success', message: 'Friend request declined' });
            }
        } else {
            return res.status(400).json({ status: 'failed', message: 'Invalid notification type or user' });
        }
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to accept friend request' });
    }
});

app.post('/api/v1/friend/remove', auth, async (req, res) => {
    try {
        const { friendId } = req.body;
        const removedMe = await User.updateOne(
            { _id: req.userId },
            { $pull: { friends: friendId } }
        );
        const removeThem = await User.updateOne(
            { _id: friendId },
            { $pull: { friends: req.userId } }
        );

        if (removedMe.modifiedCount !== 1 && removeThem.modifiedCount !== 1) {
            return res.status(404).json({ status: 'failed', message: 'Friend not found in your friend list' });
        } else {
            return res.json({ status: 'success', message: 'Friend removed' });
        }
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to remove friend' });
    }
});

// ====================== Socket Logic ======================

io.on("connection", (socket) => {
    console.log("✅ New WebSocket connection:", socket.id);

    // Join room per user ID (from query or handshake)
    const userId = socket.handshake.query.userId;
    if (userId) socket.join(userId);

    // Listen for "send_message" event from client
    socket.on("send_message", async (msgData) => {
        try {

            const { from_id, to_id, context_type, content, message_type = "text", reply_to = null } = msgData;
            if (!content || content.trim() === "") {
                console.warn("Socket message error: empty content");
                return;
            }

            // 💾 Gets users and id to make sure the user exist
            const currentUserMembers = await Member.find({ user: from_id });
            const otherUserMemberIds = [];
            if (context_type === "User") {
                const otherUserMembers = await Member.find({ user: to_id });
                otherUserMemberIds.push(...otherUserMembers.map((m) => m._id));
            } else if (context_type === "Room") {
                const room = await Room.findById(to_id).lean();
                const memberRecords = await Member.find({ server: room?.server }).select('_id user');
                memberRecords.forEach(member => {
                    if (member.user.toString() !== currentUserMembers[0].user.toString()) {
                        otherUserMemberIds.push(member._id);
                    }
                });
            }
            if (!currentUserMembers.length && !otherUserMemberIds.length) {
                console.warn("Socket message error: member records not found");
                return;
            }

            console.log('new message');

            // validate reply_to is part of the same DM FIX LATER
            // if (reply_to) {
            //     const parent = await Message.findById(reply_to).lean();
            //     if (!parent || parent.context_type !== 'User') return;
            //     // PLEASE FIX
            //     const samePair = (
            //     String(parent.context) === String(to_id) ||
            //     String(parent.context) === String(from_id)
            //     );
            //     if (!samePair) return;
            // }

            // create message in DB 
            const message = await Message.create({
                sender: currentUserMembers[0]._id,
                recipients: otherUserMemberIds,
                context: to_id,
                context_type: context_type,
                content: content.trim(),
                message_type,
                reply_to: reply_to || undefined,
            });

            const populatedMessage = await Message.findById(message._id)
                .populate({
                    path: "sender",
                    populate: { path: "user", select: "username display_name icon_file", populate: { path: 'icon_file' } }
                })
                .populate({ path: "recipients", populate: { path: "user", select: "username display_name" } })
                .populate({
                    path: "reply_to",
                    populate: [
                        { path: "sender", populate: { path: "user", select: "username display_name icon_file", populate: { path: 'icon_file' } } },
                        { path: "recipients", populate: { path: "user", select: "username display_name" } }
                    ]
                })
                .lean();

            // Emit the message to both sender and recipient
            io.to(from_id).emit("receive_message", populatedMessage);
            //emmit to all recipient member ids
            for (const recipientId of otherUserMemberIds) {
                io.to(recipientId.toString()).emit("receive_message", populatedMessage);
            }

            // if mentiond, create notification
            const mentionRegex = /@([\w]+)/g;
            let match;
            const mentionedUsernames = new Set();

            while ((match = mentionRegex.exec(content)) !== null) {
                mentionedUsernames.add(match[1]);
            }
            for (const username of mentionedUsernames) {
                const mentionedUser = await User.findOne({ username }).lean();
                if (mentionedUser && String(mentionedUser._id) !== String(from_id)) {
                    const result = await Notification.create({ user: mentionedUser._id, type: 'MENTION', location: message._id, from: from_id });
                }
            }
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
