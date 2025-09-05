const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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
    res.send(data);
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