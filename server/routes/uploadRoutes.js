const express = require('express');
const router = express.Router();

// Check if Cloudinary is configured
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';

let upload;

if (isCloudinaryConfigured) {
  // Use Cloudinary in production
  const { upload: cloudinaryUpload } = require('../config/cloudinary');
  upload = cloudinaryUpload;
  console.log('✅ Using Cloudinary for image uploads');
} else {
  // Use local storage in development
  const localUpload = require('../middlewares/upload');
  upload = localUpload;
  console.log('📁 Using local storage for image uploads');
}

// Upload single image
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let imageUrl;
    
    if (isCloudinaryConfigured) {
      // Cloudinary returns full URL in req.file.path
      imageUrl = req.file.path;
    } else {
      // Local upload returns filename
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.API_URL 
        : `http://localhost:${process.env.PORT || 5000}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    
    res.json({
      success: true,
      message: `Image uploaded successfully ${isCloudinaryConfigured ? 'to Cloudinary' : 'locally'}`,
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

// Upload multiple images
router.post('/images', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    let imageUrls;
    
    if (isCloudinaryConfigured) {
      imageUrls = req.files.map(file => file.path);
    } else {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.API_URL 
        : `http://localhost:${process.env.PORT || 5000}`;
      imageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
    }
    
    res.json({
      success: true,
      message: `Images uploaded successfully ${isCloudinaryConfigured ? 'to Cloudinary' : 'locally'}`,
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
