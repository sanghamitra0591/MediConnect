const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');

router.post('/register', doctorController.register);
router.post('/login', doctorController.login);
router.post('/logout', auth('doctor'), doctorController.logout);
router.patch('/availability', auth('doctor'), doctorController.toggleAvailability);
router.get('/me', auth('doctor'), doctorController.getMe);
router.get('/', auth('admin'), doctorController.getAll);
router.get('/available', auth('admin'), doctorController.getAvailable);
router.get('/:id', auth('admin'), doctorController.getOne);
router.patch('/:id', auth('admin'), doctorController.update);
router.delete('/:id', auth('admin'), doctorController.remove);

module.exports = router;
