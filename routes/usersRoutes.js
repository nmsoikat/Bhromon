const express = require('express');

const {signupUser, loginUser} = require('../controller/authController');

const {getAllUser} = require('../controller/userController')

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

router.route('/').get(getAllUser);

module.exports = router;