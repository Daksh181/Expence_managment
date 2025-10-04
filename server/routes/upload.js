const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');
const { validateFileUpload } = require('../middleware/validation');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'), false);
    }
  }
});

// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private
router.post('/single', protect, upload.single('file'), validateFileUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `expense-management/${req.user.companyId}/receipts`,
          resource_type: 'auto',
          public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      data: {
        filename: result.public_id,
        originalName: req.file.originalname,
        url: result.secure_url,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
});

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('files', 10), validateFileUpload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `expense-management/${req.user.companyId}/receipts`,
            resource_type: 'auto',
            public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              filename: result.public_id,
              originalName: file.originalname,
              url: result.secure_url,
              size: file.size,
              mimetype: file.mimetype,
              uploadedAt: new Date()
            });
          }
        );

        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
});

// @desc    Delete file
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed'
    });
  }
});

module.exports = router;

