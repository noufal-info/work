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
        if (!course_id || !student_email) {
            return res.status(400).json({ success: false, message: 'Course ID and Student Email are required.' });
        }
        await db.execute(`
            CREATE TABLE IF NOT EXISTS enrollments (
              id INT AUTO_INCREMENT PRIMARY KEY,
              course_id INT NOT NULL,
              student_email VARCHAR(255) NOT NULL,
              status VARCHAR(50) DEFAULT 'Pending',
              enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY unique_enrollment (course_id, student_email)
            )
        `);
        await db.execute('INSERT IGNORE INTO enrollments (course_id, student_email, status) VALUES (?, ?, ?)', [course_id, student_email, 'Pending']);
        res.json({ success: true, message: 'Enrollment request sent to teacher' });
    } catch (error) {
        console.error("Error self-enrolling:", error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

router.get('/courses/available', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM courses WHERE status = 'Published' ORDER BY id DESC");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching available courses:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/courses/enrolled', async (req, res) => {
    try {
        const { email } = req.query;
        const [rows] = await db.execute(`
            SELECT c.*, e.status as enrollment_status 
            FROM enrollments e 
            JOIN courses c ON e.course_id = c.id 
            WHERE e.student_email = ?
        `, [email]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/messages', async (req, res) => {
    try {
        const { email } = req.query;
        const [rows] = await db.execute(`
            SELECT m.*, c.title as course_name 
            FROM messages m
            LEFT JOIN courses c ON m.course_id = c.id
            WHERE m.receiver_email = ? 
               OR m.course_id IN (SELECT course_id FROM enrollments WHERE student_email = ? AND status = 'Active')
            ORDER BY m.sent_at DESC
        `, [email, email]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching student messages:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
