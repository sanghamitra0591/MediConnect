const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');

router.post('/register', deviceController.register);
router.get('/', auth('admin'), deviceController.getAll);
router.get('/available', auth('admin'), deviceController.getAvailable);
router.get('/:id', auth('admin'), deviceController.getOne);
router.patch('/:id', auth('admin'), deviceController.update);
router.delete('/:id', auth('admin'), deviceController.remove);

module.exports = router;
