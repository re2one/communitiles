var express = require('express');
var router = express.Router();

let guessingController = require('../controller/guessing');

// router.get('/:gameId', guessingController.getMock);

router.post('/skip', guessingController.skip);

router.post('/guess/', guessingController.guess);

module.exports = router;