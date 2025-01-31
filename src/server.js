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

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Список кімнат
    socket.on("joinRoom", ({ username, room }) => {
        socket.join(room);
        console.log(`${username} joined room: ${room}`);

        // Сповіщення всередині кімнати
        socket.to(room).emit("message", `${username} has joined the room`);
    });

    // Обробка повідомлень у кімнаті
    socket.on("roomMessage", ({ room, message }) => {
        console.log(`Message in room ${room}: ${message}`);
        io.to(room).emit("roomMessage", message); // Надсилаємо всім у кімнаті
    });

    // Від'єднання користувача
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
