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

// app.get('/tasks', async (req, res) => {
//     const tasks = await Task.find();
//     res.json(tasks);
// });

// app.post('/tasks', async (req, res) => {
//     const task = await Task.create(req.body);
//     res.json(task);
// });

// app.put('/tasks/:id', async (req, res) => {
//     const task = await Task.findByIdAndUpdate(req.params.id, req.body);
//     res.json(task);
// });

// app.delete('/tasks/:id', async (req, res) => {
//     await Task.findByIdAndDelete(req.params.id);
//     res.sendStatus(204);
// });

const connectWithRetry = async () => {
    app.listen(PORT, console.log(`Backend running on port ${PORT}`));
    // mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    // .then(() => {
    //     console.log('MongoDB connected')
    //     db_status = true;
    // })
    // .catch(err => {
    //     console.error('MongoDB connection error. Retrying in 50s...', err.message);
    //     setTimeout(connectWithRetry, 50000);
    //     db_status = false;
    // });
};

connectWithRetry();
