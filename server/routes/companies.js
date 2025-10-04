const express = require('express');
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');
const { validateCompany, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @desc    Get company details
// @route   GET /api/companies/:id
// @access  Private
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user belongs to this company
    if (req.user.companyId.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update company settings
// @route   PUT /api/companies/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user belongs to this company
    if (req.user.companyId.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      name,
      country,
      currency,
      timezone,
      address,
      contact,
      settings
    } = req.body;

    // Update fields
    if (name) company.name = name;
    if (country) company.country = country;
    if (currency) company.currency = currency;
    if (timezone) company.timezone = timezone;
    if (address) company.address = address;
    if (contact) company.contact = contact;
    if (settings) company.settings = { ...company.settings, ...settings };

    await company.save();

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

