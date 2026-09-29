const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            return res.json({ success: true, message: 'Logged in successfully' });
        }
        
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const [rows] = await db.execute('SELECT * FROM otps WHERE email = ? AND otp = ?', [email, otp]);
        if (rows.length > 0) {
            await db.execute('DELETE FROM otps WHERE email = ?', [email]);
            res.json({ success: true, message: 'Logged in successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/subadmins', async (req, res) => {
    try {
        const { name, email } = req.body;
        await db.execute('INSERT INTO sub_admins (name, email, role) VALUES (?, ?, ?)', [name, email, 'Sub-Admin']);
        res.json({ success: true, message: 'Sub-admin created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/subadmins', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM sub_admins');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/partners', async (req, res) => {
    try {
        const { name, domain, email, password } = req.body;
        await db.execute('INSERT INTO partners (name, domain, adminEmail, password) VALUES (?, ?, ?, ?)', [name, domain, email, password]);
        res.json({ success: true, message: 'Partner created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/partners', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM partners');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/partners/impersonate', async (req, res) => {
    try {
        const { domain } = req.body;
        const [rows] = await db.execute('SELECT * FROM partners WHERE domain = ?', [domain]);
        if (rows.length > 0) {
            res.json({ success: true, domain: rows[0].domain });
        } else {
            res.status(404).json({ success: false, message: 'Partner not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
