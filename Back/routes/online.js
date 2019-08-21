var express = require('express');
var router = express.Router();

let onlineController = require('../controller/online');

router.post('/', onlineController.logUser);

router.delete('/', onlineController.logUserOut);

module.exports = router;