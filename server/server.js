const express = require('express');
const path = require('path');

const userService = require('./services/userService');
const adminService = require('./services/adminService');
const partnerService = require('./services/partnerService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'ui')));

// API Routes Mounted
app.use('/api', userService); // Mounts /api/login
app.use('/api/admin', adminService); // Mounts /api/admin/*
app.use('/api/partner', partnerService); // Mounts /api/partner/*

// HTML Routes
app.get('/AnalogiX', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'user', 'login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'user', 'index.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'index.html'));
});

app.get('/partner/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'partner', 'login.html'));
});

app.get('/partner', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'partner', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});
