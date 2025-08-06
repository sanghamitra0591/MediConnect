const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/online-doctors', auth('admin'), adminController.getOnlineDoctors);
router.get('/active-sessions', auth('admin'), adminController.getActiveSessions);
router.get('/devices', auth('admin'), adminController.getDevices);

module.exports = router;
