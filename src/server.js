const express = require('express');
const mongoose = require('mongoose');
const { PORT, MONGO_URI } = require('./config');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(express.json());

// Роутери
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Підключення до бази
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
