-- Create Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL
);

-- Insert dummy student
INSERT IGNORE INTO students (email, password, name) VALUES ('student@example.com', 'password123', 'Alex Student');

-- Create Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'Master Admin'
);

-- Insert dummy admin
INSERT IGNORE INTO admins (email, role) VALUES ('master@example.com', 'Master Admin');

-- Create Sub-Admins table
CREATE TABLE IF NOT EXISTS sub_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Sub-Admin'
);

-- Create Partners table
CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  adminEmail VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Create Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  course VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active'
);

-- Create Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Published'
);

-- Create OTPs table
CREATE TABLE IF NOT EXISTS otps (
  email VARCHAR(255) PRIMARY KEY,
  otp VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Enrollments table (links students to courses)
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (course_id, student_email)
);
