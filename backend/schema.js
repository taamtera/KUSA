const e = require('express');
const mongoose = require('mongoose');
const { Schema, models, model } = mongoose;
const ObjectId = Schema.Types.ObjectId;

/* -----------------------------
 * FILES
 * ---------------------------*/
const fileSchema = new Schema(
    {
        storage_key: { type: String, required: true, unique: true, trim: true },
        original_name: { type: String, required: true, trim: true },
        mime_type: { type: String, required: true, trim: true },
        byte_size: { type: Number, required: true, min: 0 },
        is_external: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

/* -----------------------------
 * USERS
 * ---------------------------*/
const userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        display_name: {
            type: String,
            default: function () {
                if (typeof this.username === "string") {
                    // first 50 chars of username
                    return this.username.slice(0, 50);
                }
                return undefined;
            },
            maxlength: 50,
            trim: true,
        },

        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password_hash: { type: String, required: true, select: false },
        role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },

        // Profile images
        icon_file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
        banner_file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },

        // Personal details
        bio: { type: String, trim: true, default: '' },
        pronouns: { type: String, trim: true, default: '' },
        birthday: { type: Date, default: null },
        major: { type: String, trim: true, default: '' },
        faculty: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },

        // Relations
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        timetable_visibility: {
            type: String,
            enum: ['private', 'public'],
            default: 'private'
        }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

/* -----------------------------
 * SERVERS
 * ---------------------------*/
const serverSchema = new Schema(
    {
        server_name: { type: String, required: true, trim: true },
        icon_file: { type: ObjectId, ref: 'File', default: null },
        banned_users: [{ type: ObjectId, ref: 'User' }],
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

/* -----------------------------
 * MEMBERS
 * ---------------------------*/
const memberSchema = new Schema(
    {
        user: { type: ObjectId, ref: 'User', required: true },
        server: { type: ObjectId, ref: 'Server', required: true },
        nickname: { type: String, trim: true, default: null },
        role: { type: String, enum: ['OWNER', 'MODERATOR', 'MEMBER'], default: 'MEMBER' },
    },
    { timestamps: { createdAt: 'joined_at', updatedAt: 'updated_at' } }
);

// prevent duplicate membership (one user joins a server only once)
memberSchema.index({ user: 1, server: 1 }, { unique: true });

/* -----------------------------
 * ROOMS
 * ---------------------------*/
const ROOM_TYPES = ['TEXT', 'EVENT', 'VOICE'];

const roomSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        server: { type: ObjectId, ref: 'Server', required: true },
        room_type: { type: String, enum: ROOM_TYPES, default: 'TEXT' },
        order: { type: Number, default: 0 }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// (optional) export the list for re-use in services/controllers
roomSchema.statics.TYPES = ROOM_TYPES;

// (optional) within a server, room titles could be unique
roomSchema.index({ server: 1, title: 1 }, { unique: true });

/* -----------------------------
 * MESSAGES
 * ---------------------------*/
const messageSchema = new Schema(
    {
        sender: { type: ObjectId, ref: 'User', required: true },
        recipients: [{ type: ObjectId, ref: 'Member' }],
        context: {
            type: ObjectId,
            required: true,
            refPath: 'context_type'
        },
        context_type: {
            type: String,
            enum: ['Room', 'User'],
            required: true
        },
        content: { type: String, trim: true },
        reply_to: { type: ObjectId, ref: 'Message' },
        message_type: { type: String, default: 'text' },

        active: { type: Boolean, default: true },
        edited_count: { type: Number, default: 0, min: 0 }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'edited_at' } }
);

// Sort by time
messageSchema.index({ created_at: -1 });
// Fast timeline lookups (room or DM)
messageSchema.index({ context_type: 1, context: 1, created_at: -1 });
// DM lookups by recipient/sender
messageSchema.index({ recipients: 1, created_at: -1 });
messageSchema.index({ sender: 1, created_at: -1 });
// Reply threading
messageSchema.index({ reply_to: 1, created_at: -1 });

// Focus on DM for now:
// If context_type === 'User' -> must have at least one recipient.
// For Room, do not enforce recipients yet.
messageSchema.pre('validate', function (next) {
    if (this.context_type === 'User') {
        const hasRecipients = Array.isArray(this.recipients) && this.recipients.length > 0;
        if (!hasRecipients) return next(new Error('Direct messages must include at least one recipient.'));
    }
    next();
});

/* -----------------------------
 * NOTIFICATION
 * ---------------------------*/

const notificationSchema = new Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    type: { enum: ['MENTION', 'FRIEND_REQUEST'], type: String, required: true },
    location: { type: ObjectId, ref: 'Message' },
    from: { type: ObjectId, ref: 'User', required: true },
});


/* -----------------------------
 * ATTACHMENTS
 * ---------------------------*/
const attachmentSchema = new Schema(
    {
        message: { type: ObjectId, ref: 'Message', required: true },
        file: { type: ObjectId, ref: 'File', required: true },
        position: { type: Number, default: 1, min: 1 }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ensure positions are unique per message (1,2,3,...)
attachmentSchema.index({ message: 1, position: 1 }, { unique: true });

/* -----------------------------
 * REACTIONS
 * One doc = one member reacted with one emoji on one message
 * ---------------------------*/
const reactionSchema = new Schema(
    {
        message: { type: ObjectId, ref: 'Message', required: true },
        member: { type: ObjectId, ref: 'Member', required: true },
        emoji: { type: String, required: true, trim: true }, // e.g. "👍" or ":thumbsup:"
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Prevent duplicate reaction of the same emoji by the same member on the same message
reactionSchema.index({ message: 1, member: 1, emoji: 1 }, { unique: true });

// Helpful for counts like “👍 x 3”
reactionSchema.index({ message: 1, emoji: 1 });

/* -----------------------------
 * Time Slot
 * ---------------------------*/
const DAY_ENUM = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const timeSlotSchema = new Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, default: null, trim: true },
        day: { type: String, enum: DAY_ENUM, required: true, index: true },
        start_min: { type: Number, required: true, min: 0, max: 1440 },
        end_min: { type: Number, required: true, min: 0, max: 1440 },
        location: { type: String, default: null, trim: true },
        color: { type: String, default: null },
        owner: { type: ObjectId, ref: 'User', required: true }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

// Validate start < end
timeSlotSchema.path("end_min").validate(function (v) {
    return v > this.start_min;
}, "end time must be after start time");

// Sort-friendly index per user/day
timeSlotSchema.index({ owner: 1, day: 1, start_min: 1, end_min: 1 });
timeSlotSchema.index({ owner: 1 });

/* -----------------------------
 * MODELS (re-use if already compiled)
 * ---------------------------*/
const File = models.File || model('File', fileSchema);
const User = models.User || model('User', userSchema);
const Server = models.Server || model('Server', serverSchema);
const Member = models.Member || model('Member', memberSchema);
const Room = models.Room || model('Room', roomSchema);
const Message = models.Message || model('Message', messageSchema);
const Attachment = models.Attachment || model('Attachment', attachmentSchema);
const Reaction = models.Reaction || model('Reaction', reactionSchema);
const TimeSlot = models.TimeSlot || model('TimeSlot', timeSlotSchema);
const Notification = models.Notification || model('Notification', notificationSchema);

module.exports = { User, File, Server, Member, Room, Message, Attachment, Reaction, TimeSlot, Notification };
