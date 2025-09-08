const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const app = express().use(cors()).use(express.json());

const PORT = 3001;
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/kusa';

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

app.get('/profile/:id', async (req, res) => {
    console.log("Health check received");
    let data = { profile: {username: "name", image: "asd.png", id: req.params.id}}
    res.send(data);
});

// post DATA FROM FRONTEND TO BACKEND (SAVE)
app.post('/api/v1/login', async (req, res) => {
    // const task = await Task.create(req.body);
    console.log(req.body);
    if (req.body.email == "amornrit.s@ku.th" && req.body.password == "ballkub123") { // check from database
        res.send(200)
    } else {
        res.status(400).send('400 - Try new username or password');
    }
});

app.post('/api/v1/create_account', async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password } = req.body;

        // Check if email already exists
        const existingUser = await monmodel.findOne({ email: email });
        if (existingUser) {
            return res.status(409).send("This email has already been registered");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new monmodel({
            username: username,
            email: email,
            password: hashedPassword
        });

        await newUser.save();
        res.send("Account created!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


app.get('/api/v1/user/:id', async (req, res) => {
    console.log("Amogus");
    let data = {role : "role", description : "description", username : "username", create_at : "create at", id : req.params.id}
    res.send(data)
});

app.put('/api/v1/user/:id', async (req, res) => {
  try {
    const upid = req.params.id;
    const { username, password } = req.body;

    // 1. Find user
    const user = await monmodel.findById(upid);
    if (!user) return res.status(404).send("User not found");

    // 2. Compare password
    console.log(user.password);
    console.log(password);
    const isMatch = await bcrypt.compare(password, user.password); // temporary
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).send("Wrong password ❌");
    }

    // 3. Update username
    user.username = username;
    await user.save();

    res.json({ message: "✅ Username updated", user });

  } catch (err) {
    res.status(400).send("400 - Error: " + err.message);
  }
});


const sch={
    username: String,
    email: String,
    password: String
}

const monmodel=mongoose.model("users", sch);

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

function InitializeDatabaseStructures() {
    

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