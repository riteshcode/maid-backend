const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { validateRegister, validateLogin } = require('../validators/user.validator');

router.post('/register', validateRegister, UserController.register);
router.post('/login', validateLogin, UserController.login);

module.exports = router;