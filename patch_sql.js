const fs = require('fs');
let sql = fs.readFileSync('database_schema.sql', 'utf8');

if (!sql.includes('calendar_events')) {
    sql += `\n
-- Create Calendar Events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  event_type VARCHAR(100),
  color_code VARCHAR(20) DEFAULT '#FFB74D'
);

-- Create Course Reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  rating DECIMAL(3,1) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
    fs.writeFileSync('database_schema.sql', sql);
}
console.log("SQL Schema Updated");
