const express = require('express');

const {signupUser, loginUser, forgotPassword, resetPassword, updatePassword, protect} = require('../controller/authController');

const {getAllUser} = require('../controller/userController')

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-my-password',protect, updatePassword);


router.route('/').get(getAllUser);

module.exports = router;