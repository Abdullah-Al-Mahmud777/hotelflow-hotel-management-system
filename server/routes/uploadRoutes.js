const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

// Upload single image to Cloudinary
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Cloudinary automatically uploads and returns URL
    const imageUrl = req.file.path; // This is the Cloudinary URL
    
    res.json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Upload multiple images to Cloudinary
router.post('/images', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const imageUrls = req.files.map(file => file.path);
    
    res.json({
      success: true,
      message: 'Images uploaded successfully to Cloudinary',
      imageUrls: imageUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

module.exports = router;
