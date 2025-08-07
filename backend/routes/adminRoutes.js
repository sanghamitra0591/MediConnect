const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Unified login route
router.post('/login', adminController.unifiedLogin); // /api/admin/login
// Admin signup route
router.post('/signup', adminController.signup); // /api/admin/signup
router.get('/online-doctors', auth('admin'), adminController.getOnlineDoctors);
router.get('/active-sessions', auth('admin'), adminController.getActiveSessions);
router.get('/devices', auth('admin'), adminController.getDevices);

module.exports = router;
