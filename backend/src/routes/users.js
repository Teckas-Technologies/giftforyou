const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { updateProfileValidator } = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Profile
router.put('/me', updateProfileValidator, userController.updateProfile);
router.post('/me/photo', upload.single('photo'), userController.uploadPhoto);
router.put('/me/onboarding-seen', userController.markOnboardingSeen);
router.put('/me/email', userController.updateEmail);
router.put('/me/password', userController.updatePassword);
router.put('/me/settings', userController.updateSettings);
router.delete('/me', userController.deleteAccount);

// Dashboard
router.get('/dashboard/stats', userController.getDashboardStats);

// Anniversaries
router.get('/anniversaries', userController.getAnniversaries);
router.post('/anniversaries', userController.addAnniversary);
router.delete('/anniversaries/:id', userController.deleteAnniversary);

module.exports = router;
