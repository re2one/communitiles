var express = require('express');
var router = express.Router();

let recommendingController = require('../controller/recommending');

router.get('/:gameId', recommendingController.initSegments);

router.post('/', recommendingController.setSegments);

router.post('/accept', recommendingController.accept);

module.exports = router;