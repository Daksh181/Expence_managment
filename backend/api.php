<?php
require_once 'config.php';
header('Content-Type: application/json');

// Simple router
$action = $_GET['action'] ?? '';


switch ($action) {
    case 'signup':
        // Company & Admin signup
        $data = json_decode(file_get_contents('php://input'), true);
        $company = $data['company'] ?? '';
        $country = $data['country'] ?? '';
        $currency = $data['currency'] ?? '';
        $admin_name = $data['admin_name'] ?? '';
        $admin_email = $data['admin_email'] ?? '';
        $admin_password = password_hash($data['admin_password'] ?? '', PASSWORD_DEFAULT);
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO companies (name, country, currency) VALUES (?, ?, ?)');
            $stmt->execute([$company, $country, $currency]);
            $company_id = $pdo->lastInsertId();
            $stmt = $pdo->prepare('INSERT INTO users (company_id, name, email, password, role) VALUES (?, ?, ?, ?, "admin")');
            $stmt->execute([$company_id, $admin_name, $admin_email, $admin_password]);
            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password'])) {
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['error' => 'Invalid credentials']);
        }
        break;
    case 'create_user':
        $data = json_decode(file_get_contents('php://input'), true);
        $company_id = $data['company_id'] ?? '';
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
        $role = $data['role'] ?? 'employee';
        $stmt = $pdo->prepare('INSERT INTO users (company_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$company_id, $name, $email, $password, $role]);
        echo json_encode(['success' => true]);
        break;
    case 'submit_expense':
        $data = json_decode(file_get_contents('php://input'), true);
        $employee_id = $data['employee_id'] ?? '';
        $company_id = $data['company_id'] ?? '';
        $category = $data['category'] ?? '';
        $description = $data['description'] ?? '';
        $expense_date = $data['expense_date'] ?? '';
        $amount = $data['amount'] ?? '';
        $currency = $data['currency'] ?? '';
        $status = 'waiting_approval';
        $stmt = $pdo->prepare('INSERT INTO expenses (employee_id, company_id, category, description, expense_date, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$employee_id, $company_id, $category, $description, $expense_date, $amount, $currency, $status]);
        echo json_encode(['success' => true]);
        break;
    case 'approve_expense':
        $data = json_decode(file_get_contents('php://input'), true);
        $expense_id = $data['expense_id'] ?? '';
        $approver_id = $data['approver_id'] ?? '';
        $status = $data['status'] ?? '';
        $comments = $data['comments'] ?? '';
        $stmt = $pdo->prepare('UPDATE approvals SET status = ?, comments = ?, approved_at = NOW() WHERE expense_id = ? AND approver_id = ?');
        $stmt->execute([$status, $comments, $expense_id, $approver_id]);
        // Optionally update expense status if all approvals done
        echo json_encode(['success' => true]);
        break;
    case 'ocr_receipt':
        // Simulate OCR receipt upload
        $data = json_decode(file_get_contents('php://input'), true);
        $expense_id = $data['expense_id'] ?? '';
        $ocr_data = json_encode($data['ocr_data'] ?? []);
        $stmt = $pdo->prepare('INSERT INTO receipts (expense_id, ocr_data) VALUES (?, ?)');
        $stmt->execute([$expense_id, $ocr_data]);
        echo json_encode(['success' => true]);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>
