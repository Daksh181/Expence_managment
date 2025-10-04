const express = require('express');
const Tesseract = require('tesseract.js');
const { protect } = require('../middleware/auth');
const { validateFileUpload } = require('../middleware/validation');
const multer = require('multer');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files for OCR
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for OCR'), false);
    }
  }
});

// @desc    Extract text from receipt image
// @route   POST /api/ocr/extract
// @access  Private
router.post('/extract', protect, upload.single('image'), validateFileUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    // Perform OCR on the image
    const { data: { text, confidence } } = await Tesseract.recognize(
      req.file.buffer,
      'eng',
      {
        logger: m => console.log(m) // Optional: log OCR progress
      }
    );

    // Parse the extracted text to find relevant information
    const extractedData = parseReceiptText(text);

    res.status(200).json({
      success: true,
      data: {
        rawText: text,
        confidence: confidence,
        extractedData: extractedData
      }
    });
  } catch (error) {
    console.error('OCR extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'OCR extraction failed'
    });
  }
});

// Helper function to parse receipt text and extract relevant information
function parseReceiptText(text) {
  const extractedData = {
    amount: null,
    date: null,
    merchant: null,
    items: [],
    confidence: 0
  };

  // Amount patterns (various currency formats)
  const amountPatterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*\$?(\d+\.?\d*)/i,
    /\$(\d+\.?\d*)/g,
    /(\d+\.?\d*)\s*(?:usd|dollars?)/i,
    /total[:\s]*(\d+\.?\d*)/i
  ];

  // Date patterns
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})/i
  ];

  // Merchant patterns (usually at the top of receipt)
  const merchantPatterns = [
    /^([A-Z][A-Z\s&]+[A-Z])\s*$/m,
    /^([A-Z][a-z\s&]+[a-z])\s*$/m
  ];

  // Extract amount
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (amount > 0) {
        extractedData.amount = amount;
        break;
      }
    }
  }

  // Extract date
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const dateStr = match[1];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          extractedData.date = date;
          break;
        }
      } catch (error) {
        // Continue to next pattern
      }
    }
  }

  // Extract merchant (first few lines, usually uppercase)
  const lines = text.split('\n').slice(0, 5);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 3 && trimmedLine.length < 50) {
      // Check if line looks like a merchant name
      if (/^[A-Z][A-Z\s&]+[A-Z]$/.test(trimmedLine) || 
          /^[A-Z][a-z\s&]+[a-z]$/.test(trimmedLine)) {
        extractedData.merchant = trimmedLine;
        break;
      }
    }
  }

  // Extract items (lines that might be products/services)
  const itemLines = text.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 5 && 
           trimmed.length < 100 && 
           !trimmed.match(/total|subtotal|tax|amount/i) &&
           !trimmed.match(/^\d+[\/\-]\d+[\/\-]\d+/) && // Not a date
           !trimmed.match(/^\$?\d+\.?\d*$/) && // Not just a number
           trimmed.match(/[a-zA-Z]/); // Contains letters
  });

  extractedData.items = itemLines.slice(0, 10); // Limit to first 10 items

  // Calculate confidence based on extracted data
  let confidence = 0;
  if (extractedData.amount) confidence += 40;
  if (extractedData.date) confidence += 30;
  if (extractedData.merchant) confidence += 20;
  if (extractedData.items.length > 0) confidence += 10;

  extractedData.confidence = confidence;

  return extractedData;
}

// @desc    Get OCR supported languages
// @route   GET /api/ocr/languages
// @access  Private
router.get('/languages', protect, async (req, res) => {
  try {
    const languages = [
      { code: 'eng', name: 'English' },
      { code: 'spa', name: 'Spanish' },
      { code: 'fra', name: 'French' },
      { code: 'deu', name: 'German' },
      { code: 'ita', name: 'Italian' },
      { code: 'por', name: 'Portuguese' },
      { code: 'rus', name: 'Russian' },
      { code: 'chi_sim', name: 'Chinese (Simplified)' },
      { code: 'chi_tra', name: 'Chinese (Traditional)' },
      { code: 'jpn', name: 'Japanese' },
      { code: 'kor', name: 'Korean' },
      { code: 'ara', name: 'Arabic' },
      { code: 'hin', name: 'Hindi' }
    ];

    res.status(200).json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Get OCR languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported languages'
    });
  }
});

module.exports = router;

