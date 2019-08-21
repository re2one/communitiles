var express = require('express');
var router = express.Router();

let loginController = require('../controller/login');
router.post('/', loginController.login);

module.exports = router;
