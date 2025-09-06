const express = require('express');
const router = express.Router();
const ChallengeController = require('../controllers/challengeController');

const challengeController = new ChallengeController();

router.get('/challenges', challengeController.getChallenges.bind(challengeController));

module.exports = router;
