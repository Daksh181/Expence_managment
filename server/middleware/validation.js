const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Role must be admin, manager, or employee'),
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Company validation rules
const validateCompany = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('currency')
    .isLength({ min: 3, max: 3 })
    .isUppercase()
    .withMessage('Currency must be a 3-letter uppercase code'),
  handleValidationErrors
];

// Expense validation rules
const validateExpense = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .isIn([
      'Travel', 'Meals', 'Accommodation', 'Transportation',
      'Office Supplies', 'Software', 'Training', 'Marketing',
      'Entertainment', 'Utilities', 'Other'
    ])
    .withMessage('Invalid category'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .isLength({ min: 3, max: 3 })
    .isUppercase()
    .withMessage('Currency must be a 3-letter uppercase code'),
  body('expenseDate')
    .isISO8601()
    .withMessage('Expense date must be a valid date'),
  handleValidationErrors
];

// Approval validation rules
const validateApproval = [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters'),
  handleValidationErrors
];

// Approval rule validation rules
const validateApprovalRule = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Rule name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('ruleType')
    .isIn(['sequential', 'percentage', 'conditional', 'hybrid'])
    .withMessage('Invalid rule type'),
  body('approvers')
    .isArray({ min: 1 })
    .withMessage('At least one approver is required'),
  body('approvers.*.userId')
    .isMongoId()
    .withMessage('Invalid approver user ID'),
  body('approvers.*.role')
    .isIn(['manager', 'finance', 'director', 'admin'])
    .withMessage('Invalid approver role'),
  body('approvers.*.order')
    .isInt({ min: 1 })
    .withMessage('Approver order must be a positive integer'),
  handleValidationErrors
];

// Password reset validation rules
const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

const validatePasswordResetConfirm = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const files = req.files || [req.file];
  
  for (const file of files) {
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'
      });
    }

    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  }

  next();
};

module.exports = {
  handleValidationErrors,
  validateUser,
  validateLogin,
  validateCompany,
  validateExpense,
  validateApproval,
  validateApprovalRule,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validateObjectId,
  validatePagination,
  validateDateRange,
  validateFileUpload
};

