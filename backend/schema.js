const mongoose = require('mongoose');
const { Schema, models, model } = mongoose;
const ObjectId = Schema.Types.ObjectId;

/* -----------------------------
 * FILES
 * ---------------------------*/
const fileSchema = new Schema(
    {
        storage_key:   { type: String, required: true, unique: true, trim: true },
        original_name: { type: String, required: true, trim: true },
        mime_type:     { type: String, required: true, trim: true },
        byte_size:     { type: Number, required: true, min: 0 },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

/* -----------------------------
 * USERS
 * ---------------------------*/
const userSchema = new Schema(
    {
        username:      { type: String, required: true, unique: true, trim: true },
        display_name:  { type: String, default: function () {return this.username} }, 
        email:         { type: String, required: true, unique: true, trim: true, lowercase: true },
        password_hash: { type: String, required: true, select: false },
        role:          { type: String, required: true, default: 'USER' },
        icon_file:     { type: ObjectId, ref: 'file', default: null },
        banner_file:   { type: ObjectId, ref: 'file', default: null },
        description:   { type: String, trim: true, default: null },
        gender:        { type: String, default: null },
        birthday:      { type: Date, default: null },
        major:         { type: String, default: null },
        faculty:       { type: String, default: null },
        phone_number:         { type: String, default: null } 
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

/* -----------------------------
 * SERVERS
 * ---------------------------*/
const serverSchema = new Schema(
    {
        server_name: { type: String, required: true, trim: true }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

/* -----------------------------
 * MEMBERS
 * ---------------------------*/
const memberSchema = new Schema(
    {
        user:    { type: ObjectId, ref: 'user', required: true },
        server:  { type: ObjectId, ref: 'server', required: true },
        nickname:{ type: String, trim: true, defautl: null },
        role:    { type: String, default: 'member' }
    },
    { timestamps: { createdAt: 'joined_at', updatedAt: 'updated_at' } }
);

// prevent duplicate membership (one user joins a server only once)
memberSchema.index({ user: 1, server: 1 }, { unique: true });

/* -----------------------------
 * ROOMS
 * ---------------------------*/
const ROOM_TYPES = ['TEXT', 'ANNOUNCEMENT', 'VOICE'];

const roomSchema = new Schema(
    {
        title:     { type: String, required: true, trim: true },
        icon_file: { type: ObjectId, ref: 'file', default: null },
        server:    { type: ObjectId, ref: 'server', required: true },
        room_type: { type: String, enum: ROOM_TYPES, default: 'TEXT' }
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
        sender:       { type: ObjectId, ref: 'member', required: true },
        recipients:   [{ type: ObjectId, ref: 'member' }],
        room:         { type: ObjectId, ref: 'room' }, // null for DM/group DM
        content:      { type: String, trim: true },
        reply_to:     { type: ObjectId, ref: 'message' },
        message_type: { type: String, default: 'text' },

        active:       { type: Boolean, default: true },
        edited_count: { type: Number, default: 0, min: 0 }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'edited_at' } }
);

messageSchema.index({ room: 1, created_at: -1 });
messageSchema.index({ recipients: 1, created_at: -1 });
messageSchema.index({ sender: 1, created_at: -1 });

// Simple rule: either room OR recipients (but not both / not neither)
messageSchema.pre('validate', function (next) {
    const hasRoom = !!this.room;
    const hasRecipients = Array.isArray(this.recipients) && this.recipients.length > 0;
    if (hasRoom === hasRecipients) {
        return next(new Error('Message must have either room (for channel) OR recipients (for DM/group DM), but not both.'));
    }
    next();
});

/* -----------------------------
 * ATTACHMENTS
 * ---------------------------*/
const attachmentSchema = new Schema(
    {
        message:  { type: ObjectId, ref: 'message', required: true },
        file:     { type: ObjectId, ref: 'file', required: true },
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
    message: { type: ObjectId, ref: 'message', required: true },
    member:  { type: ObjectId, ref: 'member',  required: true },
    emoji:   { type: String, required: true, trim: true }, // e.g. "👍" or ":thumbsup:"
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Prevent duplicate reaction of the same emoji by the same member on the same message
reactionSchema.index({ message: 1, member: 1, emoji: 1 }, { unique: true });

// Helpful for counts like “👍 x 3”
reactionSchema.index({ message: 1, emoji: 1 });

/* -----------------------------
 * MODELS (re-use if already compiled)
 * ---------------------------*/
const File       = models.file       || model('file', fileSchema);
const User       = models.user       || model('user', userSchema);
const Server     = models.server     || model('server', serverSchema);
const Member     = models.member     || model('member', memberSchema);
const Room       = models.room       || model('room', roomSchema);
const Message    = models.message    || model('message', messageSchema);
const Attachment = models.attachment || model('attachment', attachmentSchema);
const Reaction = models.reaction || model('reaction', reactionSchema);

module.exports = { User, File, Server, Member, Room, Message, Attachment, Reaction };
