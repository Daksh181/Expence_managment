const express = require('express');
const User = require('../models/User');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const { protect, authorize, authorizeAdminOrManager } = require('../middleware/auth');
const { validateUser, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { companyId: req.user.companyId };
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.department) {
      filter.department = new RegExp(req.query.department, 'i');
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('companyId', 'name country currency')
      .populate('managerId', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this user's data
    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== req.params.id &&
        req.user._id.toString() !== user.managerId?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
router.post('/', protect, authorize('admin'), validateUser, async (req, res) => {
  try {
    const { name, email, password, role, managerId, department, position, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await User.findOne({ 
        _id: managerId, 
        companyId: req.user.companyId,
        role: { $in: ['admin', 'manager'] }
      });
      
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager selected'
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      companyId: req.user.companyId,
      managerId: managerId || null,
      department,
      position,
      phone
    });

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      companyId: req.user.companyId,
      type: 'user_created',
      title: 'Welcome to the team!',
      message: `Welcome ${user.name}! Your account has been created.`,
      priority: 'medium',
      metadata: {
        senderId: req.user._id
      }
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Fields that can be updated
    const allowedFields = ['name', 'department', 'position', 'phone'];
    const updateFields = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Admin can update additional fields
    if (req.user.role === 'admin') {
      if (req.body.role !== undefined) {
        updateFields.role = req.body.role;
      }
      if (req.body.managerId !== undefined) {
        updateFields.managerId = req.body.managerId;
      }
      if (req.body.isActive !== undefined) {
        updateFields.isActive = req.body.isActive;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    // Create notification for user updates
    if (req.user._id.toString() !== req.params.id) {
      await Notification.create({
        userId: user._id,
        companyId: req.user.companyId,
        type: 'user_updated',
        title: 'Profile Updated',
        message: 'Your profile has been updated by an administrator.',
        priority: 'low',
        metadata: {
          senderId: req.user._id
        }
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has any expenses
    const Expense = require('../models/Expense');
    const expenseCount = await Expense.countDocuments({ employeeId: req.params.id });
    
    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with existing expenses. Deactivate instead.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get team members (for managers)
// @route   GET /api/users/team
// @access  Private/Manager
router.get('/team', protect, authorizeAdminOrManager, async (req, res) => {
  try {
    let filter = { companyId: req.user.companyId };

    // If user is manager, get their team members
    if (req.user.role === 'manager') {
      filter.managerId = req.user._id;
    }

    const teamMembers = await User.find(filter)
      .select('-password')
      .populate('managerId', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get managers list (for admin)
// @route   GET /api/users/managers
// @access  Private/Admin
router.get('/managers', protect, authorize('admin'), async (req, res) => {
  try {
    const managers = await User.find({
      companyId: req.user.companyId,
      role: { $in: ['admin', 'manager'] }
    })
    .select('-password')
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers
    });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

