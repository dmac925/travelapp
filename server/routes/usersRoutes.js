const express = require('express');
const router = express.Router();

const controller = require('../controllers/usersController');

router.post('/getUserIDByEmail', controller.getUserIDByEmail);

router.post('/register', controller.register);

router.post('/verify_token', controller.verify_token);

router.post('/login', controller.login);

router.get('/', controller.findAll);

router.get('/find/:email', controller.findUserByEmail );



module.exports = router;