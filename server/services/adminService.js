const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/login', (req, res) => {
    const { email } = req.body;
    const admin = db.admins.find(a => a.email === email) || db.subAdmins.find(a => a.email === email);
    if (admin) {
        const otp = '123456'; // Fixed for demo purposes
        db.otps[email] = otp;
        console.log(`[MOCK EMAIL] OTP for ${email} is ${otp}`);
        res.json({ success: true, message: 'OTP sent' });
    } else {
        res.status(401).json({ success: false, message: 'Admin not found' });
    }
});

router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (db.otps[email] && db.otps[email] === otp) {
        delete db.otps[email];
        res.json({ success: true, message: 'Logged in successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid OTP' });
    }
});

router.post('/subadmins', (req, res) => {
    const { name, email } = req.body;
    db.subAdmins.push({ name, email, role: 'Sub-Admin' });
    res.json({ success: true, message: 'Sub-admin created successfully' });
});

router.get('/subadmins', (req, res) => {
    res.json(db.subAdmins);
});

router.post('/partners', (req, res) => {
    const { name, domain, email, password } = req.body;
    db.partners.push({ name, domain, adminEmail: email, password });
    res.json({ success: true, message: 'Partner created successfully' });
});

router.get('/partners', (req, res) => {
    res.json(db.partners);
});

router.post('/partners/impersonate', (req, res) => {
    const { domain } = req.body;
    const partner = db.partners.find(p => p.domain === domain);
    if(partner) {
        res.json({ success: true, domain: partner.domain });
    } else {
        res.status(404).json({ success: false, message: 'Partner not found' });
    }
});

module.exports = router;
