const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Message = require('../models/Message');

const router = express.Router();

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Отримати всі повідомлення
router.get('/messages', authenticate, async (req, res) => {
    const messages = await Message.find().populate('user', 'username').sort({ timestamp: 1 });
    res.json(messages);
});

// Надіслати повідомлення
router.post('/message', authenticate, async (req, res) => {
    const { text } = req.body;
    const message = new Message({ user: req.user.id, text });
    await message.save();

    res.status(201).json(message);
});

module.exports = router;
