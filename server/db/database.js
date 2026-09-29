const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost', // or the hostname provided by Hostinger
    user: 'u999617803_knowlipop',
    password: 'Knowlipop@2026',
    database: 'u999617803_knowlipop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
