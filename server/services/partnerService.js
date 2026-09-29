const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const partner = db.partners.find(p => p.adminEmail === email && p.password === password);
    if (partner) {
        res.json({ success: true, domain: partner.domain });
    } else {
        res.status(401).json({ success: false, message: 'Invalid partner credentials' });
    }
});

module.exports = router;
