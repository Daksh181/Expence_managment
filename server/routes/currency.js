const express = require('express');
const { protect } = require('../middleware/auth');
const { convertCurrency, getExchangeRates, getSupportedCurrencies, formatCurrency } = require('../utils/currencyConverter');

const router = express.Router();

// @desc    Get supported currencies
// @route   GET /api/currency/supported
// @access  Private
router.get('/supported', protect, async (req, res) => {
  try {
    const currencies = getSupportedCurrencies();
    
    res.status(200).json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Get supported currencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported currencies'
    });
  }
});

// @desc    Get exchange rates
// @route   GET /api/currency/rates
// @access  Private
router.get('/rates', protect, async (req, res) => {
  try {
    const baseCurrency = req.query.base || 'USD';
    const rates = await getExchangeRates(baseCurrency);
    
    res.status(200).json({
      success: true,
      data: {
        base: baseCurrency,
        rates: rates,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exchange rates'
    });
  }
});

// @desc    Convert currency
// @route   POST /api/currency/convert
// @access  Private
router.post('/convert', protect, async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Amount, from currency, and to currency are required'
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const conversion = await convertCurrency(amount, from, to);
    
    res.status(200).json({
      success: true,
      data: {
        ...conversion,
        formatted: {
          from: formatCurrency(conversion.amount, from),
          to: formatCurrency(conversion.convertedAmount, to)
        }
      }
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Currency conversion failed'
    });
  }
});

// @desc    Format currency amount
// @route   POST /api/currency/format
// @access  Private
router.post('/format', protect, async (req, res) => {
  try {
    const { amount, currency, locale } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Amount and currency are required'
      });
    }

    if (isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a number'
      });
    }

    const formatted = formatCurrency(parseFloat(amount), currency, locale);
    
    res.status(200).json({
      success: true,
      data: {
        amount: parseFloat(amount),
        currency: currency,
        formatted: formatted
      }
    });
  } catch (error) {
    console.error('Currency formatting error:', error);
    res.status(500).json({
      success: false,
      message: 'Currency formatting failed'
    });
  }
});

module.exports = router;

