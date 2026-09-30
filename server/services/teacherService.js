const express = require('express');
const fs = require('fs');
const path = require('path');
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
        const [rows] = await db.execute(`
            SELECT c.*, 
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrolled_count
            FROM courses c ORDER BY c.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/students/enroll', async (req, res) => {
    try {
        const { course_id, student_email } = req.body;
        
        // Ensure student exists, or create a dummy one
        const [studentRows] = await db.execute('SELECT * FROM students WHERE email = ?', [student_email]);
        if (studentRows.length === 0) {
            // Auto-create student with a default password so they can log in
            await db.execute("INSERT INTO students (email, password, name) VALUES (?, 'password123', 'New Student')", [student_email]);
        }

        // Enroll student directly as 'Active' since teacher is adding them
        await db.execute('INSERT IGNORE INTO enrollments (course_id, student_email, status) VALUES (?, ?, ?)', [course_id, student_email, 'Active']);
        res.json({ success: true, message: 'Student enrolled successfully' });
    } catch (error) {
        console.error("Error enrolling student:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/enrollments/pending', async (req, res) => {
    try {
        // In a real app, we'd filter by course_id belonging to this teacher
        const [rows] = await db.execute(`
            SELECT e.id as enrollment_id, e.student_email, c.title as course_title, e.enrolled_at 
            FROM enrollments e 
            JOIN courses c ON e.course_id = c.id 
            WHERE e.status = 'Pending' 
            ORDER BY e.enrolled_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching pending enrollments:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/enrollments/approve', async (req, res) => {
    try {
        const { enrollment_id, action } = req.body; // action = 'accept' or 'reject'
        
        if (action === 'accept') {
            await db.execute("UPDATE enrollments SET status = 'Active' WHERE id = ?", [enrollment_id]);
            res.json({ success: true, message: 'Student accepted successfully' });
        } else if (action === 'reject') {
            await db.execute("UPDATE enrollments SET status = 'Rejected' WHERE id = ?", [enrollment_id]);
            res.json({ success: true, message: 'Student rejected successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid action' });
        }
    } catch (error) {
        console.error("Error updating enrollment:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/messages', async (req, res) => {
    try {
        const { sender_email, receiver_email, course_id, subject, content, audio_base64 } = req.body;
        
        let audio_url = null;
        if (audio_base64) {
            const base64Data = audio_base64.replace(/^data:audio\/\w+(?:;\w+=\w+(?:-\w+)?)?;base64,/, "");
            const filename = `audio_${Date.now()}.webm`;
            const filepath = path.join(__dirname, '..', 'uploads', 'audio', filename);
            fs.writeFileSync(filepath, base64Data, 'base64');
            audio_url = `/uploads/audio/${filename}`;
        }
        await db.execute(
            'INSERT INTO messages (sender_email, receiver_email, course_id, subject, content, audio_url) VALUES (?, ?, ?, ?, ?, ?)',
            [sender_email, receiver_email || null, course_id || null, subject, content, audio_url]
        );
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.get('/messages/contacts', async (req, res) => {
    try {
        const { email } = req.query; 
        const [courses] = await db.execute("SELECT id, title FROM courses");
        const [students] = await db.execute(`
            SELECT DISTINCT s.email, s.name 
            FROM students s
            JOIN enrollments e ON s.email = e.student_email
        `);
        res.json({ courses, students });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/messages/history', async (req, res) => {
    try {
        const { email, receiver_email, course_id } = req.query;
        let query = "";
        let params = [];
        if (course_id) {
            query = "SELECT * FROM messages WHERE course_id = ? ORDER BY sent_at ASC";
            params = [course_id];
        } else if (receiver_email) {
            query = `
                SELECT * FROM messages 
                WHERE (sender_email = ? AND receiver_email = ?) 
                   OR (sender_email = ? AND receiver_email = ?)
                ORDER BY sent_at ASC
            `;
            params = [email, receiver_email, receiver_email, email];
        } else {
            return res.json([]);
        }
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

