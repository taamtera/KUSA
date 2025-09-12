const mongoose = require('mongoose');

// USER
const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password_hash: { type: String, required: true, select: false},
        role: { type: String, required: true, default: "USER" },
        description: { type: String }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

const serverSchema = new mongoose.Schema(
  {
    server_name: { type: String, required: true }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

const memberSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    server:   { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
    nickname: { type: String },
    role:     [{ type: String, default: undefined }]
  },
  {
    timestamps: { createdAt: "joined_at", updatedAt: "updated_at" }
  }
);

memberSchema.index({ user: 1, server: 1 }, { unique: true });

User = mongoose.models.User || mongoose.model('users', userSchema);
Server = mongoose.models.Server || mongoose.model('servers', serverSchema);
Member = mongoose.models.Member || mongoose.model('members', memberSchema);

module.exports = {
  User,
  Server,
  Member,
  // Room,
  // Message
};