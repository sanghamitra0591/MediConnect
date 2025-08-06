const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');

router.post('/register', doctorController.register);
router.post('/login', doctorController.login);
router.post('/logout', auth('doctor'), doctorController.logout);
router.patch('/availability', auth('doctor'), doctorController.toggleAvailability);

module.exports = router;
