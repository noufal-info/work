const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.execute('SELECT * FROM students WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/courses/enroll', async (req, res) => {
    try {
        const { course_id, student_email } = req.body;
        
        // Student self-enrolls as 'Pending'
        await db.execute('INSERT IGNORE INTO enrollments (course_id, student_email, status) VALUES (?, ?, ?)', [course_id, student_email, 'Pending']);
        res.json({ success: true, message: 'Enrollment request sent to teacher' });
    } catch (error) {
        console.error("Error self-enrolling:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
