const express = require('express');
const router = express.Router();
const VIPController = require('../controllers/vipController');

const vipController = new VIPController();

router.get('/vip-levels', vipController.getVIPLevels.bind(vipController));

module.exports = router;
