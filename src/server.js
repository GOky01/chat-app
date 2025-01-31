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

const Message = require('./models/Message'); // Підключаємо модель

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Коли юзер підключається до кімнати
    socket.on("joinRoom", async ({ username, room }) => {
        socket.join(room);
        console.log(`${username} joined room: ${room}`);
        console.log("Active rooms:", Array.from(io.sockets.adapter.rooms.keys()));

        // Завантажуємо історію повідомлень
        const messages = await Message.find({ room }).sort({ timestamp: 1 });
        socket.emit("roomHistory", messages);

        // Повідомляємо про підключення
        io.to(room).emit("message", `${username} has joined the room`);
    });

    socket.on("roomMessage", async ({ room, message, username }) => {
        // Перевірка даних
        if (!room || !message || !username) {
            console.log("Invalid message data");
            return;
        }
    
        // Логування
        console.log(`Message in room ${room}: ${message}`);
    
        // Зберігаємо в MongoDB
        const newMessage = new Message({ room, username, text: message });
        await newMessage.save();
    
        // Розсилаємо повідомлення всім у кімнаті
        io.to(room).emit("roomMessage", newMessage);
    });    

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    
        const rooms = io.sockets.adapter.rooms;
        for (const [roomName, clients] of rooms) {
            if (clients.size === 0) {
                console.log(`Room ${roomName} is empty and can be deleted.`);
            }
        }
    });    
});


server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
