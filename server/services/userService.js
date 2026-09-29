const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.students.find(s => s.email === email && s.password === password);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

module.exports = router;
