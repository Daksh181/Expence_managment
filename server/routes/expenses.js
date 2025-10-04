const express = require('express');
const Expense = require('../models/Expense');
const ApprovalRule = require('../models/ApprovalRule');
const Notification = require('../models/Notification');
const { protect, authorize, authorizeExpenseAccess } = require('../middleware/auth');
const { validateExpense, validateObjectId, validatePagination, validateDateRange } = require('../middleware/validation');
const { convertCurrency } = require('../utils/currencyConverter');

const router = express.Router();

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
router.get('/', protect, validatePagination, validateDateRange, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { companyId: req.user.companyId };

    // Role-based filtering
    if (req.user.role === 'employee') {
      filter.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      // Managers can see their team's expenses and expenses they need to approve
      filter.$or = [
        { employeeId: req.user._id },
        { 'approvalFlow.approverId': req.user._id }
      ];
    }
    // Admin can see all expenses

    // Additional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.employeeId && req.user.role === 'admin') {
      filter.employeeId = req.query.employeeId;
    }

    if (req.query.startDate && req.query.endDate) {
      filter.expenseDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') }
      ];
    }

    const expenses = await Expense.find(filter)
      .populate('employeeId', 'name email department')
      .populate('currentApprover', 'name email')
      .populate('approvalFlow.approverId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Expense.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
router.get('/:id', protect, validateObjectId('id'), authorizeExpenseAccess, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email department position')
      .populate('currentApprover', 'name email')
      .populate('approvalFlow.approverId', 'name email role department');

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
router.post('/', protect, validateExpense, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      amount,
      currency,
      expenseDate,
      receipts,
      tags
    } = req.body;

    // Get company base currency
    const Company = require('../models/Company');
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Convert currency
    const conversion = await convertCurrency(amount, currency, company.currency);

    // Create expense
    const expense = await Expense.create({
      employeeId: req.user._id,
      companyId: req.user.companyId,
      title,
      description,
      category,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      convertedAmount: conversion.convertedAmount,
      baseCurrency: company.currency,
      exchangeRate: conversion.rate,
      expenseDate: new Date(expenseDate),
      receipts: receipts || [],
      tags: tags || []
    });

    // Get applicable approval rules
    const approvalRules = await ApprovalRule.find({
      companyId: req.user.companyId,
      isActive: true
    });

    // Apply approval rules
    let applicableApprovers = [];
    for (const rule of approvalRules) {
      const approvers = rule.getApplicableApprovers(expense);
      if (approvers.length > 0) {
        applicableApprovers = approvers;
        break; // Use first applicable rule
      }
    }

    // If no rules apply, check if auto-approval is possible
    if (applicableApprovers.length === 0) {
      if (conversion.convertedAmount <= company.settings.autoApprovalLimit) {
        expense.status = 'approved';
        await expense.save();
      } else {
        expense.status = 'pending';
        await expense.save();
      }
    } else {
      // Set up approval flow
      expense.approvalFlow = applicableApprovers.map((approver, index) => ({
        approverId: approver.userId,
        order: index + 1,
        status: index === 0 ? 'pending' : 'pending'
      }));

      expense.currentApprover = applicableApprovers[0].userId;
      expense.status = 'pending';
      await expense.save();

      // Create notification for first approver
      await Notification.create({
        userId: applicableApprovers[0].userId,
        companyId: req.user.companyId,
        type: 'expense_requires_approval',
        title: 'New Expense Requires Approval',
        message: `${req.user.name} submitted an expense of ${conversion.convertedAmount} ${company.currency} for approval.`,
        priority: 'high',
        relatedEntity: {
          type: 'expense',
          id: expense._id
        },
        actionUrl: `/expenses/${expense._id}`,
        metadata: {
          senderId: req.user._id,
          expenseAmount: conversion.convertedAmount,
          expenseCategory: category
        }
      });
    }

    // Populate the expense for response
    const populatedExpense = await Expense.findById(expense._id)
      .populate('employeeId', 'name email department')
      .populate('currentApprover', 'name email')
      .populate('approvalFlow.approverId', 'name email role');

    res.status(201).json({
      success: true,
      data: populatedExpense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
router.put('/:id', protect, validateObjectId('id'), authorizeExpenseAccess, async (req, res) => {
  try {
    const expense = req.expense;

    // Check if expense can be updated
    if (expense.status !== 'draft' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Only draft expenses can be updated'
      });
    }

    const {
      title,
      description,
      category,
      amount,
      currency,
      expenseDate,
      receipts,
      tags
    } = req.body;

    // Update fields
    if (title) expense.title = title;
    if (description !== undefined) expense.description = description;
    if (category) expense.category = category;
    if (amount) expense.amount = parseFloat(amount);
    if (currency) expense.currency = currency.toUpperCase();
    if (expenseDate) expense.expenseDate = new Date(expenseDate);
    if (receipts) expense.receipts = receipts;
    if (tags) expense.tags = tags;

    // Recalculate currency conversion if amount or currency changed
    if (amount || currency) {
      const Company = require('../models/Company');
      const company = await Company.findById(req.user.companyId);
      const conversion = await convertCurrency(expense.amount, expense.currency, company.currency);
      
      expense.convertedAmount = conversion.convertedAmount;
      expense.exchangeRate = conversion.rate;
    }

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id)
      .populate('employeeId', 'name email department')
      .populate('currentApprover', 'name email')
      .populate('approvalFlow.approverId', 'name email role');

    res.status(200).json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete('/:id', protect, validateObjectId('id'), authorizeExpenseAccess, async (req, res) => {
  try {
    const expense = req.expense;

    // Check if expense can be deleted
    if (expense.status !== 'draft' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Only draft expenses can be deleted'
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get expense statistics
// @route   GET /api/expenses/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const filter = { companyId: req.user.companyId };

    // Role-based filtering
    if (req.user.role === 'employee') {
      filter.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      filter.$or = [
        { employeeId: req.user._id },
        { 'approvalFlow.approverId': req.user._id }
      ];
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.expenseDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const stats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$convertedAmount' },
          averageAmount: { $avg: '$convertedAmount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          draftCount: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          }
        }
      }
    ]);

    // Category breakdown
    const categoryStats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$convertedAmount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalExpenses: 0,
          totalAmount: 0,
          averageAmount: 0,
          pendingCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          draftCount: 0
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

