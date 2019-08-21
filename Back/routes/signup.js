var express = require('express');
var router = express.Router();

let signupController = require('../controller/signup');
router.post('/', signupController.signup);

module.exports = router;
