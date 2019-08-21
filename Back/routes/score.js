var express = require('express');
var router = express.Router();

let scoreController = require('../controller/score');

router.get('/self', scoreController.getUserScore);

router.get('/overall', scoreController.getScore);

module.exports = router;