var express = require('express');
var router = express.Router();

let pairingController = require('../controller/pairing');

router.post('/', pairingController.addUser);

module.exports = router;