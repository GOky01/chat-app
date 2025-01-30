const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const router = express.Router();
const messages = []; // Тимчасово зберігаємо в пам'яті

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

router.get('/messages', authenticate, (req, res) => {
    res.json(messages);
});

router.post('/message', authenticate, (req, res) => {
    const { text } = req.body;
    const message = { user: req.user.id, text, timestamp: new Date() };
    messages.push(message);
    res.status(201).json(message);
});

module.exports = router;
