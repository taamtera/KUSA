const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const app = express().use(cors()).use(express.json());

// Import schema
const { User, Server, Member } = require('./schema.js');

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

async function InitializeDatabaseStructures() {

    // ------------------------------
    // 1. Seed Users
    // ------------------------------
    const samples = [
    {
        username: "adminUser",
        email: "admin@example.com",
        password: "admin123",
        role: "ADMIN", // explicit
        description: "Seeded admin account"
    },
    {
        username: "demoUser",
        email: "demo@example.com",
        password: "demo123",
        // no role → should default to "USER"
        description: "Seeded demo user"
    },
    {
        username: "testUser",
        email: "test@example.com",
        password: "test123",
        role: "USER"
        // no description → should just be missing
    }
    ];

    for (const sample of samples) {
        const exists = await User.findOne({ email: sample.email });
        if (!exists) {
            const hashed = await bcrypt.hash(sample.password, 10);
            const newUser = new User({
                username: sample.username,
                email: sample.email,
                password_hash: hashed,
                role: sample.role,
                description: sample.description
            });
            await newUser.save();
            console.log(`✅ Created sample user: ${sample.email}`);
        } else {
            console.log(`ℹ️ User ${sample.email} already exists, skipping`);
        }
    }

    // ------------------------------
    // 2. Seed Servers
    // ------------------------------
    const sampleServers = ["General Chat", "Gaming Hub", "Developers Lounge"];
    const servers = [];
    for (const name of sampleServers) {
        let server = await Server.findOne({ server_name: name });
        if (!server) {
        server = new Server({ server_name: name });
        await server.save();
        console.log(`✅ Created server: ${name}`);
        } else {
        console.log(`ℹ️ Server already exists: ${name}`);
        }
        servers.push(server);
    }

    // ------------------------------
    // 3. Seed Members (after users + servers exist)
    // ------------------------------
    const userAdmin = await User.findOne({ email: "admin@example.com" });
    const userDemo = await User.findOne({ email: "demo@example.com" });
    const userTest = await User.findOne({ email: "test@example.com" });

    const memberships = [
        { user: userAdmin._id, server: servers[0]._id, nickname: "BossMan", role: ["OWNER"] },
        { user: userDemo._id,  server: servers[0]._id, nickname: "Demo", role: ["MOD"] },
        { user: userDemo._id,  server: servers[1]._id, nickname: "GamerDemo", role: ["USER"] },
        { user: userTest._id,  server: servers[2]._id, nickname: "CoderTest", role: ["USER"] }
    ];

    for (const m of memberships) {
        try {
        const existing = await Member.findOne({ user: m.user, server: m.server });
        if (!existing) {
            await Member.create(m);
            console.log(`✅ Added member ${m.nickname} to server`);
        } else {
            console.log(`ℹ️ Member already exists: ${m.nickname}`);
        }
        } catch (err) {
        console.error("⚠️ Error creating member:", err.message);
        }
    }
}

// Keep db_status accurate on connection state changes
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
    db_status = true;
    // check if there are any databse structures needed and create them if not
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