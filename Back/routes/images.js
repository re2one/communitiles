var express = require('express');
var router = express.Router();

let imagesController = require('../controller/images');

router.get('/segments/:segmentId', imagesController.getImages);

router.get('/positions', imagesController.getPositions);

router.get('/dimension', imagesController.getDimension);

router.get('/refresh', imagesController.getRefresh);

module.exports = router;