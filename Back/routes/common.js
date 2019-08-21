var express = require('express');
var router = express.Router();

let commonController = require('../controller/common');

router.post('/miss', commonController.miss);

router.post('/quit', commonController.quit);

module.exports = router;