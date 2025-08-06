const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/initiate', sessionController.initiate);
router.get('/active', sessionController.getActive);
router.patch('/:sessionId/complete', sessionController.complete);
router.patch('/:sessionId/cancel', sessionController.cancel);

module.exports = router;
