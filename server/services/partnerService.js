const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.execute('SELECT * FROM partners WHERE adminEmail = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            res.json({ success: true, domain: rows[0].domain });
        } else {
            res.status(401).json({ success: false, message: 'Invalid partner credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
