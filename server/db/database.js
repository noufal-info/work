const db = {
    students: [{ email: 'student@example.com', password: 'password123', name: 'Alex Student' }],
    admins: [{ email: 'master@example.com', role: 'Master Admin' }],
    subAdmins: [],
    partners: [],
    otps: {} // Store OTPs temporarily
};

module.exports = db;
