const fs = require('fs');

// 1. Update database_schema.sql
let schema = fs.readFileSync('database_schema.sql', 'utf8');
if (!schema.includes('course_sections')) {
    schema += `
-- Create Course Sections table
CREATE TABLE IF NOT EXISTS course_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0
);

-- Create Course Lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0
);
`;
    fs.writeFileSync('database_schema.sql', schema);
}

// 2. Update adminService.js
let adminSvc = fs.readFileSync('server/services/adminService.js', 'utf8');
if (!adminSvc.includes('course_sections')) {
    const tableInitStr = `
        try { await db.execute("ALTER TABLE courses ADD COLUMN icon VARCHAR(255) DEFAULT 'book-outline';"); } catch(e) {}
        await db.execute(\`
            CREATE TABLE IF NOT EXISTS course_sections (
              id INT AUTO_INCREMENT PRIMARY KEY,
              course_id INT NOT NULL,
              title VARCHAR(255) NOT NULL,
              order_index INT DEFAULT 0
            )
        \`);
        await db.execute(\`
            CREATE TABLE IF NOT EXISTS course_lessons (
              id INT AUTO_INCREMENT PRIMARY KEY,
              section_id INT NOT NULL,
              title VARCHAR(255) NOT NULL,
              video_url VARCHAR(255) NOT NULL,
              order_index INT DEFAULT 0
            )
        \`);
        
        // Sample Data
        await db.execute("INSERT IGNORE INTO teachers (id, name, email, course, password, status) VALUES (1, 'Prof. Smith', 'smith@example.com', 'Web Development', 'password123', 'Active')");
        await db.execute("INSERT IGNORE INTO courses (id, title, description, instructor, price, status, icon) VALUES (1, 'Complete Web Development Bootcamp', 'Learn HTML, CSS, JavaScript and Node.js', 'smith@example.com', 99.99, 'Published', 'globe-outline')");
        await db.execute("INSERT IGNORE INTO course_sections (id, course_id, title, order_index) VALUES (1, 1, 'Introduction to Web Development', 1), (2, 1, 'HTML5 Fundamentals', 2)");
        await db.execute("INSERT IGNORE INTO course_lessons (id, section_id, title, video_url, order_index) VALUES (1, 1, 'What is the web?', 'https://www.w3schools.com/html/mov_bbb.mp4', 1), (2, 1, 'How the internet works', 'https://www.w3schools.com/html/mov_bbb.mp4', 2), (3, 2, 'HTML Basics', 'https://www.w3schools.com/html/mov_bbb.mp4', 1)");
`;
    adminSvc = adminSvc.replace('console.log("Teachers, Courses, Enrollments, and Messages tables initialized.");', tableInitStr + '\n        console.log("Teachers, Courses, Enrollments, and Messages tables initialized.");');
    fs.writeFileSync('server/services/adminService.js', adminSvc);
}

// 3. Update teacherService.js
let teacherSvc = fs.readFileSync('server/services/teacherService.js', 'utf8');
if (!teacherSvc.includes('multer')) {
    const teacherInject = `
const multer = require('multer');
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads', 'videos');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const uploadVideo = multer({ storage: videoStorage });

router.post('/courses/:id/sections', async (req, res) => {
    try {
        const { title, order_index } = req.body;
        const [result] = await db.execute('INSERT INTO course_sections (course_id, title, order_index) VALUES (?, ?, ?)', [req.params.id, title, order_index || 0]);
        res.json({ success: true, section_id: result.insertId });
    } catch (error) { res.status(500).json({ success: false }); }
});

router.post('/sections/:id/lessons', uploadVideo.single('video'), async (req, res) => {
    try {
        const { title, order_index } = req.body;
        const video_url = req.file ? '/uploads/videos/' + req.file.filename : '';
        await db.execute('INSERT INTO course_lessons (section_id, title, video_url, order_index) VALUES (?, ?, ?, ?)', [req.params.id, title, video_url, order_index || 0]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
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
`;
    teacherSvc = teacherSvc.replace('router.post(\'/login\', async (req, res) => {', teacherInject + '\nrouter.post(\'/login\', async (req, res) => {');
    fs.writeFileSync('server/services/teacherService.js', teacherSvc);
}

// 4. Update userService.js
let userSvc = fs.readFileSync('server/services/userService.js', 'utf8');
if (!userSvc.includes('/courses/:id/structure')) {
    const userInject = `
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
`;
    userSvc = userSvc.replace('module.exports = router;', userInject + '\nmodule.exports = router;');
    fs.writeFileSync('server/services/userService.js', userSvc);
}
