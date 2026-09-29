require('dotenv').config();
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
    res.redirect('/AnalogiX');
});

app.get('/AnalogiX/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'login.html'));
});

app.get('/AnalogiX/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'index.html'));
});

app.get('/AnalogiX/admin/teachers', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'teachers.html'));
});

app.get('/AnalogiX/admin/courses', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'courses.html'));
});

app.get('/AnalogiX/admin/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'calendar.html'));
});

app.get('/AnalogiX/admin/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'messages.html'));
});

app.get('/AnalogiX/admin/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'reports.html'));
});

app.get('/AnalogiX/admin/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin', 'settings.html'));
});

app.get('/AnalogiX/partner/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'partner', 'login.html'));
});

app.get('/AnalogiX/partner', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'partner', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});
