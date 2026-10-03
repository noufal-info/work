const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Initialize tables automatically
(async function initTables() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS teachers (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              course VARCHAR(255),
              password VARCHAR(255) NOT NULL,
              status VARCHAR(50) DEFAULT 'Active'
            )
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS courses (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              instructor VARCHAR(255),
              price DECIMAL(10,2) NOT NULL,
              status VARCHAR(50) DEFAULT 'Published'
            )
        `);
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
        await db.execute(`
            CREATE TABLE IF NOT EXISTS messages (
              id INT AUTO_INCREMENT PRIMARY KEY,
              sender_email VARCHAR(255) NOT NULL,
              receiver_email VARCHAR(255),
              course_id INT,
              subject VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              audio_url VARCHAR(255),
              sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Ensure audio_url exists for existing databases
        try {
            await db.execute("ALTER TABLE messages ADD COLUMN audio_url VARCHAR(255);");
        } catch(e) {
            // Ignore error if column already exists
        }
        
        try { await db.execute("ALTER TABLE courses ADD COLUMN icon VARCHAR(255) DEFAULT 'book-outline';"); } catch(e) {}
        try { await db.execute("ALTER TABLE course_lessons ADD COLUMN description TEXT;"); } catch(e) {}
        try { await db.execute("ALTER TABLE enrollments ADD COLUMN status VARCHAR(50) DEFAULT 'Pending';"); } catch(e) {}
        await db.execute(`
            CREATE TABLE IF NOT EXISTS course_sections (
              id INT AUTO_INCREMENT PRIMARY KEY,
              course_id INT NOT NULL,
              title VARCHAR(255) NOT NULL,
              order_index INT DEFAULT 0
            )
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS students (
              id INT AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              name VARCHAR(255) NOT NULL
            )
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS course_lessons (
              id INT AUTO_INCREMENT PRIMARY KEY,
              section_id INT NOT NULL,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              video_url VARCHAR(255) NOT NULL,
              order_index INT DEFAULT 0
            )
        `);
        
        try { await db.execute("ALTER TABLE course_lessons ADD COLUMN description TEXT;"); } catch(e) {}
        
        // Sample Data
        await db.execute("INSERT IGNORE INTO teachers (id, name, email, course, password, status) VALUES (1, 'Prof. Smith', 'smith@example.com', 'Web Development', 'password123', 'Active')");
        await db.execute("INSERT IGNORE INTO courses (id, title, description, instructor, price, status, icon) VALUES (1, 'Complete Web Development Bootcamp', 'Learn HTML, CSS, JavaScript and Node.js', 'smith@example.com', 99.99, 'Published', 'globe-outline')");
        await db.execute("INSERT IGNORE INTO course_sections (id, course_id, title, order_index) VALUES (1, 1, 'Introduction to Web Development', 1), (2, 1, 'HTML5 Fundamentals', 2)");
        await db.execute("INSERT IGNORE INTO course_lessons (id, section_id, title, video_url, order_index) VALUES (1, 1, 'What is the web?', 'https://www.w3schools.com/html/mov_bbb.mp4', 1), (2, 1, 'How the internet works', 'https://www.w3schools.com/html/mov_bbb.mp4', 2), (3, 2, 'HTML Basics', 'https://www.w3schools.com/html/mov_bbb.mp4', 1)");
        // Remove 'Alex' from students if present
        await db.execute("DELETE FROM students WHERE name LIKE '%Alex%'");
        // Ensure a dummy student exists for testing
        await db.execute("INSERT IGNORE INTO students (email, password, name) VALUES ('student@example.com', 'password123', 'John Doe')");


        console.log("Teachers, Courses, Enrollments, and Messages tables initialized.");
    } catch (err) {
        console.error("Failed to initialize tables:", err);
    }
})();


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


// Teachers Routes
router.post('/teachers', async (req, res) => {
    try {
        const { name, email, course, password } = req.body;
        await db.execute('INSERT INTO teachers (name, email, course, password) VALUES (?, ?, ?, ?)', [name, email, course, password]);
        res.json({ success: true, message: 'Teacher created successfully' });
    } catch (error) {
        console.error("Error creating teacher:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/teachers/impersonate', async (req, res) => {
    try {
        const { id } = req.body;
        const [rows] = await db.execute('SELECT * FROM teachers WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.json({ success: true, teacher: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Teacher not found' });
        }
    } catch (error) {
        console.error("Error impersonating teacher:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/teachers', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM teachers ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Courses Routes
router.post('/courses', async (req, res) => {
    try {
        const { title, description, instructor, price } = req.body;
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
