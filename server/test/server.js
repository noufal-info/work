const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the 'ui' directory
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../ui')));

// Mock Database
const db = {
    students: [{ email: 'student@example.com', password: 'password123', name: 'John Doe' }],
    admins: [{ email: 'master@example.com', role: 'Master Admin' }],
    subAdmins: [],
    partners: [],
    otps: {} // Store OTPs temporarily
};

// API Routes
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.students.find(s => s.email === email && s.password === password);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/admin/login', (req, res) => {
    const { email } = req.body;
    const admin = db.admins.find(a => a.email === email) || db.subAdmins.find(a => a.email === email);
    if (admin) {
        // Generate mock 6-digit OTP
        const otp = '123456'; // Fixed for demo purposes
        db.otps[email] = otp;
        console.log(`[MOCK EMAIL] OTP for ${email} is ${otp}`);
        res.json({ success: true, message: 'OTP sent' });
    } else {
        res.status(401).json({ success: false, message: 'Admin not found' });
    }
});

app.post('/api/admin/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (db.otps[email] && db.otps[email] === otp) {
        delete db.otps[email];
        res.json({ success: true, message: 'Logged in successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid OTP' });
    }
});

app.post('/api/admin/subadmins', (req, res) => {
    const { name, email } = req.body;
    db.subAdmins.push({ name, email, role: 'Sub-Admin' });
    res.json({ success: true, message: 'Sub-admin created successfully' });
});

app.get('/api/admin/subadmins', (req, res) => {
    res.json(db.subAdmins);
});

// Partner Routes
app.post('/api/admin/partners', (req, res) => {
    const { name, domain, email, password } = req.body;
    db.partners.push({ name, domain, adminEmail: email, password });
    res.json({ success: true, message: 'Partner created successfully' });
});

app.get('/api/admin/partners', (req, res) => {
    res.json(db.partners);
});

app.post('/api/admin/partners/impersonate', (req, res) => {
    const { domain } = req.body;
    const partner = db.partners.find(p => p.domain === domain);
    if(partner) {
        res.json({ success: true, domain: partner.domain });
    } else {
        res.status(404).json({ success: false, message: 'Partner not found' });
    }
});

app.post('/api/partner/login', (req, res) => {
    const { email, password } = req.body;
    const partner = db.partners.find(p => p.adminEmail === email && p.password === password);
    if (partner) {
        res.json({ success: true, domain: partner.domain });
    } else {
        res.status(401).json({ success: false, message: 'Invalid partner credentials' });
    }
});

// HTML Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../ui', 'user', 'login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../ui', 'user', 'index.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../ui', 'admin', 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../ui', 'admin', 'index.html'));
});

app.get('/partner/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../ui', 'partner', 'login.html'));
});

app.get('/partner', (req, res) => {
    res.sendFile(path.join(__dirname, '../../ui', 'partner', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});
