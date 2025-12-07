const express = require('express');
const router = express.Router();
const aiHostController = require('../controllers/aiHostController');

// Generate banter with text + voice
router.post('/banter', aiHostController.generateBanter.bind(aiHostController));

// Generate text only
router.post('/text', aiHostController.generateTextOnly.bind(aiHostController));

// Generate voice from text
router.post('/voice', aiHostController.generateVoice.bind(aiHostController));

// Get host info for specific station
router.get('/info/:stationId', aiHostController.getHostInfo.bind(aiHostController));

// Get all hosts
router.get('/all', aiHostController.getAllHosts.bind(aiHostController));

module.exports = router;
