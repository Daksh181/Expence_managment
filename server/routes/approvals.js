const express = require('express');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const { protect, authorize, authorizeAdminOrManager } = require('../middleware/auth');
const { validateApproval, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get pending approvals for current user
// @route   GET /api/approvals/pending
// @access  Private/Manager
router.get('/pending', protect, authorizeAdminOrManager, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      companyId: req.user.companyId,
      status: 'pending',
      'approvalFlow.approverId': req.user._id,
      'approvalFlow.status': 'pending'
    };

    const expenses = await Expense.find(filter)
      .populate('employeeId', 'name email department')
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
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get approval history for current user
// @route   GET /api/approvals/history
// @access  Private/Manager
router.get('/history', protect, authorizeAdminOrManager, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      companyId: req.user.companyId,
      'approvalFlow.approverId': req.user._id,
      'approvalFlow.status': { $in: ['approved', 'rejected'] }
    };

    const expenses = await Expense.find(filter)
      .populate('employeeId', 'name email department')
      .populate('approvalFlow.approverId', 'name email role')
      .sort({ 'approvalFlow.actionDate': -1 })
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
    console.error('Get approval history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve or reject expense
// @route   PUT /api/approvals/:expenseId
// @access  Private/Manager
router.put('/:expenseId', protect, authorizeAdminOrManager, validateObjectId('expenseId'), validateApproval, async (req, res) => {
  try {
    const { action, comments } = req.body;

    const expense = await Expense.findById(req.params.expenseId)
      .populate('employeeId', 'name email')
      .populate('approvalFlow.approverId', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if user is authorized to approve this expense
    const userApproval = expense.approvalFlow.find(
      approval => approval.approverId._id.toString() === req.user._id.toString() && 
                  approval.status === 'pending'
    );

    if (!userApproval) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this expense'
      });
    }

    // Update approval status
    userApproval.status = action;
    userApproval.comments = comments;
    userApproval.actionDate = new Date();

    // Check if this was the last required approval
    const remainingApprovals = expense.approvalFlow.filter(
      approval => approval.status === 'pending' && approval.isRequired
    );

    if (action === 'rejected' || remainingApprovals.length === 0) {
      // Final decision made
      expense.status = action === 'approved' ? 'approved' : 'rejected';
      expense.currentApprover = null;
      
      if (action === 'rejected') {
        expense.rejectionReason = comments;
      }
    } else {
      // Move to next approver
      const nextApproval = expense.approvalFlow.find(
        approval => approval.status === 'pending' && approval.order > userApproval.order
      );
      
      if (nextApproval) {
        expense.currentApprover = nextApproval.approverId;
        
        // Create notification for next approver
        await Notification.create({
          userId: nextApproval.approverId,
          companyId: req.user.companyId,
          type: 'expense_requires_approval',
          title: 'Expense Requires Your Approval',
          message: `An expense of ${expense.convertedAmount} ${expense.baseCurrency} has been approved and forwarded to you for final approval.`,
          priority: 'high',
          relatedEntity: {
            type: 'expense',
            id: expense._id
          },
          actionUrl: `/expenses/${expense._id}`,
          metadata: {
            senderId: req.user._id,
            expenseAmount: expense.convertedAmount,
            expenseCategory: expense.category
          }
        });
      }
    }

    await expense.save();

    // Create notification for expense owner
    const notificationType = action === 'approved' ? 'expense_approved' : 'expense_rejected';
    const notificationTitle = action === 'approved' ? 'Expense Approved' : 'Expense Rejected';
    const notificationMessage = action === 'approved' 
      ? `Your expense of ${expense.convertedAmount} ${expense.baseCurrency} has been approved.`
      : `Your expense of ${expense.convertedAmount} ${expense.baseCurrency} has been rejected. ${comments ? 'Reason: ' + comments : ''}`;

    await Notification.create({
      userId: expense.employeeId._id,
      companyId: req.user.companyId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      priority: 'medium',
      relatedEntity: {
        type: 'expense',
        id: expense._id
      },
      actionUrl: `/expenses/${expense._id}`,
      metadata: {
        senderId: req.user._id,
        expenseAmount: expense.convertedAmount,
        expenseCategory: expense.category,
        approverName: req.user.name
      }
    });

    // Get updated expense with populated fields
    const updatedExpense = await Expense.findById(expense._id)
      .populate('employeeId', 'name email department')
      .populate('currentApprover', 'name email')
      .populate('approvalFlow.approverId', 'name email role');

    res.status(200).json({
      success: true,
      message: `Expense ${action} successfully`,
      data: updatedExpense
    });
  } catch (error) {
    console.error('Approval action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get approval statistics
// @route   GET /api/approvals/stats
// @access  Private/Manager
router.get('/stats', protect, authorizeAdminOrManager, async (req, res) => {
  try {
    const filter = {
      companyId: req.user.companyId,
      'approvalFlow.approverId': req.user._id
    };

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter['approvalFlow.actionDate'] = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const stats = await Expense.aggregate([
      { $match: filter },
      { $unwind: '$approvalFlow' },
      { $match: { 'approvalFlow.approverId': req.user._id } },
      {
        $group: {
          _id: null,
          totalApprovals: { $sum: 1 },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$approvalFlow.status', 'approved'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$approvalFlow.status', 'rejected'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$approvalFlow.status', 'pending'] }, 1, 0] }
          },
          averageProcessingTime: {
            $avg: {
              $cond: [
                { $ne: ['$approvalFlow.actionDate', null] },
                {
                  $divide: [
                    { $subtract: ['$approvalFlow.actionDate', '$createdAt'] },
                    1000 * 60 * 60 // Convert to hours
                  ]
                },
                null
              ]
            }
          }
        }
      }
    ]);

    // Monthly approval trends
    const monthlyStats = await Expense.aggregate([
      { $match: filter },
      { $unwind: '$approvalFlow' },
      { $match: { 'approvalFlow.approverId': req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$approvalFlow.actionDate' },
            month: { $month: '$approvalFlow.actionDate' }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$approvalFlow.status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$approvalFlow.status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalApprovals: 0,
          approvedCount: 0,
          rejectedCount: 0,
          pendingCount: 0,
          averageProcessingTime: 0
        },
        monthlyTrends: monthlyStats
      }
    });
  } catch (error) {
    console.error('Get approval stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Bulk approve expenses
// @route   PUT /api/approvals/bulk
// @access  Private/Manager
router.put('/bulk', protect, authorizeAdminOrManager, async (req, res) => {
  try {
    const { expenseIds, action, comments } = req.body;

    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense IDs array is required'
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either approve or reject'
      });
    }

    const results = [];
    const errors = [];

    for (const expenseId of expenseIds) {
      try {
        const expense = await Expense.findById(expenseId);

        if (!expense) {
          errors.push({ expenseId, error: 'Expense not found' });
          continue;
        }

        // Check if user is authorized to approve this expense
        const userApproval = expense.approvalFlow.find(
          approval => approval.approverId.toString() === req.user._id.toString() && 
                      approval.status === 'pending'
        );

        if (!userApproval) {
          errors.push({ expenseId, error: 'Not authorized to approve this expense' });
          continue;
        }

        // Update approval status
        userApproval.status = action;
        userApproval.comments = comments;
        userApproval.actionDate = new Date();

        // Check if this was the last required approval
        const remainingApprovals = expense.approvalFlow.filter(
          approval => approval.status === 'pending' && approval.isRequired
        );

        if (action === 'rejected' || remainingApprovals.length === 0) {
          expense.status = action === 'approved' ? 'approved' : 'rejected';
          expense.currentApprover = null;
          
          if (action === 'rejected') {
            expense.rejectionReason = comments;
          }
        } else {
          // Move to next approver
          const nextApproval = expense.approvalFlow.find(
            approval => approval.status === 'pending' && approval.order > userApproval.order
          );
          
          if (nextApproval) {
            expense.currentApprover = nextApproval.approverId;
          }
        }

        await expense.save();
        results.push({ expenseId, status: 'success' });

        // Create notification for expense owner
        const notificationType = action === 'approved' ? 'expense_approved' : 'expense_rejected';
        const notificationTitle = action === 'approved' ? 'Expense Approved' : 'Expense Rejected';
        const notificationMessage = action === 'approved' 
          ? `Your expense of ${expense.convertedAmount} ${expense.baseCurrency} has been approved.`
          : `Your expense of ${expense.convertedAmount} ${expense.baseCurrency} has been rejected. ${comments ? 'Reason: ' + comments : ''}`;

        await Notification.create({
          userId: expense.employeeId,
          companyId: req.user.companyId,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          priority: 'medium',
          relatedEntity: {
            type: 'expense',
            id: expense._id
          },
          metadata: {
            senderId: req.user._id,
            expenseAmount: expense.convertedAmount,
            expenseCategory: expense.category,
            approverName: req.user.name
          }
        });

      } catch (error) {
        errors.push({ expenseId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk ${action} completed`,
      data: {
        processed: results.length,
        errors: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    console.error('Bulk approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

