const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is admin or manager
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Manager role required.'
    });
  }
  next();
};

// Check if user can access company data
const authorizeCompanyAccess = (req, res, next) => {
  const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: 'Company ID is required'
    });
  }

  if (req.user.role === 'admin' || req.user.companyId.toString() === companyId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your company data.'
    });
  }
};

// Check if user can access expense
const authorizeExpenseAccess = async (req, res, next) => {
  try {
    const expenseId = req.params.id || req.params.expenseId;
    const Expense = require('../models/Expense');
    
    const expense = await Expense.findById(expenseId);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Admin can access all expenses in their company
    if (req.user.role === 'admin' && req.user.companyId.toString() === expense.companyId.toString()) {
      req.expense = expense;
      return next();
    }

    // Manager can access expenses they need to approve or from their team
    if (req.user.role === 'manager') {
      const isApprover = expense.approvalFlow.some(approval => 
        approval.approverId.toString() === req.user._id.toString()
      );
      const isTeamMember = expense.employeeId.toString() === req.user._id.toString();
      
      if (isApprover || isTeamMember) {
        req.expense = expense;
        return next();
      }
    }

    // Employee can only access their own expenses
    if (req.user.role === 'employee' && expense.employeeId.toString() === req.user._id.toString()) {
      req.expense = expense;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You cannot access this expense.'
    });
  } catch (error) {
    console.error('Expense access authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in expense authorization'
    });
  }
};

// Optional authentication (for public routes that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  protect,
  authorize,
  authorizeAdminOrManager,
  authorizeCompanyAccess,
  authorizeExpenseAccess,
  optionalAuth
};

