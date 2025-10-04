-- Expense Management System Database Schema

-- Companies Table
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL
);

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'employee') NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Manager Relationships Table
CREATE TABLE manager_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    manager_id INT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Approval Rules Table
CREATE TABLE approval_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    rule_type ENUM('percentage', 'specific', 'hybrid') NOT NULL,
    percentage INT,
    specific_approver_id INT,
    description TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (specific_approver_id) REFERENCES users(id)
);

-- Expenses Table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    company_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status ENUM('draft', 'waiting_approval', 'approved', 'rejected') DEFAULT 'draft',
    receipt_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Approvals Table
CREATE TABLE approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    approver_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses(id),
    FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- Receipts Table (for OCR)
CREATE TABLE receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    ocr_data TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id)
);

-- Sample Queries
-- Create a new company and admin user
INSERT INTO companies (name, country, currency) VALUES ('Acme Corp', 'India', 'INR');
INSERT INTO users (company_id, name, email, password, role) VALUES (1, 'Admin User', 'admin@acme.com', 'hashed_password', 'admin');

-- Add an employee and manager
INSERT INTO users (company_id, name, email, password, role) VALUES (1, 'John Doe', 'john@acme.com', 'hashed_password', 'employee');
INSERT INTO users (company_id, name, email, password, role) VALUES (1, 'Jane Manager', 'jane@acme.com', 'hashed_password', 'manager');
INSERT INTO manager_relationships (employee_id, manager_id) VALUES (2, 3);

-- Define approval rule (60% approval)
INSERT INTO approval_rules (company_id, rule_type, percentage, description) VALUES (1, 'percentage', 60, '60% of approvers must approve');

-- Submit an expense
INSERT INTO expenses (employee_id, company_id, category, description, expense_date, amount, currency, status) VALUES (2, 1, 'Meal', 'Lunch with client', '2025-10-04', 1200, 'INR', 'waiting_approval');

-- Add approval
INSERT INTO approvals (expense_id, approver_id, status, comments) VALUES (1, 3, 'pending', '');

-- Add receipt with OCR data
INSERT INTO receipts (expense_id, ocr_data) VALUES (1, '{"amount":1200,"date":"2025-10-04","description":"Lunch with client"}');
