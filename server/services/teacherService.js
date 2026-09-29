const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find teacher in DB
        const [rows] = await db.execute('SELECT * FROM teachers WHERE email = ? AND password = ?', [email, password]);
        
        if (rows.length > 0) {
            return res.json({ success: true, message: 'Logged in successfully', teacher: rows[0] });
        }
        
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    } catch (error) {
        console.error("Teacher login error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Teacher Courses Routes
router.post('/courses', async (req, res) => {
    try {
        const { title, description, instructor, price } = req.body;
        // In a real app, 'instructor' would be securely pulled from session/token
        await db.execute('INSERT INTO courses (title, description, instructor, price) VALUES (?, ?, ?, ?)', [title, description, instructor, price]);
        res.json({ success: true, message: 'Course published successfully' });
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/courses', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM courses ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
