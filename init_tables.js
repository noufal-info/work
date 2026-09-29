const pool = require('./server/db/database');

async function createTables() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS teachers (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              course VARCHAR(255),
              password VARCHAR(255) NOT NULL,
              status VARCHAR(50) DEFAULT 'Active'
            )
        `);
        console.log("Teachers table created or exists.");

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS courses (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              instructor VARCHAR(255),
              price DECIMAL(10,2) NOT NULL,
              status VARCHAR(50) DEFAULT 'Published'
            )
        `);
        console.log("Courses table created or exists.");

    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        process.exit();
    }
}

createTables();
