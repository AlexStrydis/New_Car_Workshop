-- SQL schema for workshop_management

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  identity_number VARCHAR(20) NOT NULL,
  role ENUM('customer','mechanic','secretary') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vat_number VARCHAR(20) NOT NULL UNIQUE,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS mechanics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  car_type VARCHAR(50) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  doors_number INT NOT NULL,
  wheels_number INT NOT NULL,
  production_date DATE NOT NULL,
  acquisition_year INT NOT NULL,
  license_plate VARCHAR(20),
  mileage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  car_id INT NOT NULL,
  mechanic_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason ENUM('service','repair') NOT NULL,
  problem_description TEXT,
  status ENUM('created','in_progress','completed','cancelled') NOT NULL DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (car_id) REFERENCES cars(id),
  FOREIGN KEY (mechanic_id) REFERENCES mechanics(id)
);

CREATE TABLE IF NOT EXISTS works (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  description TEXT NOT NULL,
  materials TEXT NOT NULL,
  completion_hours DECIMAL(5,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

