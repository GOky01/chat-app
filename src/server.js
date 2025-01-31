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

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Зберігаємо онлайн-користувачів
const onlineUsers = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Коли користувач логіниться/підключається
    socket.on('addUser', (username) => {
        onlineUsers[socket.id] = username;
        console.log(`${username} is online`);

        // Надсилаємо список онлайн-користувачів всім клієнтам
        io.emit('updateUsers', Object.values(onlineUsers));
    });

    // Від'єднання
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Видаляємо юзера зі списку
        delete onlineUsers[socket.id];

        // Оновлюємо список онлайн-користувачів
        io.emit('updateUsers', Object.values(onlineUsers));
    });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
