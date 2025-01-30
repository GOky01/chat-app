const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const { PORT, MONGO_URI } = require('./config');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Підключення до MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Обробка підключення WebSocket
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Отримуємо повідомлення від клієнта
    socket.on('chatMessage', (msg) => {
        console.log('Message received:', msg);

        // Надсилаємо всім підключеним юзерам
        io.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
