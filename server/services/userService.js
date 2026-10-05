const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const db = require('../db/database');

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads', 'images');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const uploadImage = multer({ storage: imageStorage });

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
        const { email } = req.query;
        let query = "SELECT * FROM courses WHERE status = 'Published' ORDER BY id DESC";
        let params = [];
        if (email) {
            query = `
                SELECT c.*, e.status as enrollment_status 
                FROM courses c 
                LEFT JOIN enrollments e ON e.course_id = c.id AND e.student_email = ?
                WHERE c.status = 'Published' 
                ORDER BY c.id DESC
            `;
            params = [email];
        }
        const [rows] = await db.execute(query, params);
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
            SELECT c.*, e.status as enrollment_status, COALESCE(e.progress_percentage, 0) as progress_percentage 
            FROM enrollments e 
            JOIN courses c ON e.course_id = c.id 
            WHERE e.student_email = ?
        `, [email]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message, stack: error.stack });
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
               OR m.sender_email = ?
               OR (m.course_id IS NOT NULL AND m.course_id IN (SELECT course_id FROM enrollments WHERE student_email = ? AND status = 'Active'))
            ORDER BY m.sent_at DESC
        `, [email, email, email]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching student messages:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/messages/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/messages/delete', async (req, res) => {
    try {
        const { id, email } = req.body;
        if (id) {
            await db.execute('DELETE FROM messages WHERE id = ?', [id]);
        } else if (email) {
            await db.execute('DELETE FROM messages WHERE sender_email = ? OR receiver_email = ?', [email, email]);
        }
        res.json({ success: true, message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


router.get('/courses/:id/structure', async (req, res) => {
    try {
        const [sections] = await db.execute('SELECT * FROM course_sections WHERE course_id = ? ORDER BY order_index', [req.params.id]);
        for (let section of sections) {
            const [lessons] = await db.execute('SELECT * FROM course_lessons WHERE section_id = ? ORDER BY order_index', [section.id]);
            section.lessons = lessons;
        }
        res.json({ success: true, sections });
    } catch (error) { res.status(500).json({ success: false }); }
});

router.get('/me', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.json({ success: false });

        // Ensure columns exist
        try {
            await db.execute('ALTER TABLE students ADD COLUMN phone_number VARCHAR(50) NULL');
        } catch (e) {}
        try {
            await db.execute('ALTER TABLE students ADD COLUMN avatar_url VARCHAR(255) NULL');
        } catch (e) {}

        // Migrate legacy 'John Doe' placeholder to 'Rahul Nair'
        await db.execute("UPDATE students SET name = 'Rahul Nair' WHERE email = ? AND name = 'John Doe'", [email]);

        const [rows] = await db.execute('SELECT id, name, email, phone_number, avatar_url FROM students WHERE email = ?', [email]);
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

async function handleStudentProfileUpdate(req, res) {
    try {
        const { email, name, phone_number, password } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Student email is required.' });
        }

        // Ensure columns exist
        try {
            await db.execute('ALTER TABLE students ADD COLUMN phone_number VARCHAR(50) NULL');
        } catch (e) {}
        try {
            await db.execute('ALTER TABLE students ADD COLUMN avatar_url VARCHAR(255) NULL');
        } catch (e) {}

        let avatar_url = req.body.existing_avatar || null;
        if (req.file) {
            avatar_url = '/uploads/images/' + req.file.filename;
        }

        const setClauses = [];
        const params = [];

        if (name && name.trim()) {
            setClauses.push('name = ?');
            params.push(name.trim());
        }

        if (phone_number !== undefined && phone_number !== null) {
            setClauses.push('phone_number = ?');
            params.push(phone_number.trim());
        }

        if (avatar_url) {
            setClauses.push('avatar_url = ?');
            params.push(avatar_url);
        }

        if (password && password.trim()) {
            setClauses.push('password = ?');
            params.push(password.trim());
        }

        if (setClauses.length > 0) {
            const query = 'UPDATE students SET ' + setClauses.join(', ') + ' WHERE email = ?';
            params.push(email);
            await db.execute(query, params);
        }

        const [rows] = await db.execute('SELECT id, name, email, phone_number, avatar_url FROM students WHERE email = ?', [email]);
        const updatedUser = rows[0] || { name, email, phone_number, avatar_url };

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating student profile:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

router.post('/profile', uploadImage.single('avatar'), handleStudentProfileUpdate);
router.post('/student/profile', uploadImage.single('avatar'), handleStudentProfileUpdate);
router.put('/profile', uploadImage.single('avatar'), handleStudentProfileUpdate);

router.post('/courses/feedback', async (req, res) => {
    try {
        const { course_id, student_email, rating, review_text } = req.body;
        await db.execute(
            'INSERT INTO course_reviews (course_id, student_email, rating, review_text) VALUES (?, ?, ?, ?)',
            [course_id, student_email, rating || 5.0, review_text || 'Great course!']
        );
        res.json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/messages', async (req, res) => {
    try {
        const { sender_email, course_id, subject, content } = req.body;
        let receiver_email = null;
        if (course_id) {
            const [course] = await db.execute('SELECT instructor FROM courses WHERE id = ?', [course_id]);
            if (course.length > 0) {
                const inst = course[0].instructor;
                if (inst && inst.includes('@')) {
                    receiver_email = inst;
                } else {
                    const [tch] = await db.execute('SELECT email FROM teachers WHERE name = ? LIMIT 1', [inst]);
                    if (tch.length > 0) receiver_email = tch[0].email;
                }
            }
        }
        await db.execute(
            'INSERT INTO messages (sender_email, receiver_email, course_id, subject, content) VALUES (?, ?, ?, ?, ?)',
            [sender_email, receiver_email, course_id || null, subject, content]
        );
        res.json({ success: true, message: 'Message sent to instructor' });
    } catch (error) {
        console.error("Error sending student message:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/events', async (req, res) => {
    try {
        const { email } = req.query;
        let events = [];
        try {
            const [rows] = await db.execute(`
                SELECT e.id, e.teacher_email, e.course_id, e.title, e.start_time, e.end_time, e.event_type, e.color_code, e.meeting_link,
                       COALESCE(c.title, 'General Live Class') as course_title,
                       COALESCE(t.name, e.teacher_email, 'Instructor') as teacher_name
                FROM calendar_events e
                LEFT JOIN teachers t ON e.teacher_email = t.email
                LEFT JOIN courses c ON e.course_id = c.id
                ORDER BY e.start_time ASC
                LIMIT 20
            `);
            events = rows;
        } catch (e) {
            console.error("Error fetching calendar events:", e);
        }

        if (!events || events.length === 0) {
            events = [
                {
                    id: 1,
                    title: 'Live Full Stack Masterclass',
                    start_time: '2026-10-04 09:00:00',
                    end_time: '2026-10-04 10:30:00',
                    event_type: 'Live Session',
                    color_code: '#4f5be8',
                    meeting_link: 'https://meet.google.com/abc-defg-hij',
                    course_title: 'Full Stack Web Development',
                    teacher_name: 'Instructor'
                },
                {
                    id: 2,
                    title: 'Code Review & Doubt Clearance',
                    start_time: '2026-10-04 11:30:00',
                    end_time: '2026-10-04 13:00:00',
                    event_type: 'Mentorship',
                    color_code: '#10b981',
                    meeting_link: 'https://meet.google.com/xyz-uvwx-rst',
                    course_title: 'Python & Django Bootcamp',
                    teacher_name: 'Instructor'
                },
                {
                    id: 3,
                    title: 'Assignment Review & Solutions',
                    start_time: '2026-10-05 15:00:00',
                    end_time: '2026-10-05 16:30:00',
                    event_type: 'Live Class',
                    color_code: '#6366f1',
                    meeting_link: 'https://meet.google.com/mno-pqrs-tuv',
                    course_title: 'Database Architecture',
                    teacher_name: 'Instructor'
                }
            ];
        }
        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
