const express = require('express');

const {signupUser, loginUser, forgotPassword, resetPassword, updatePassword, protect} = require('../controller/authController');

const {getAllUser, updateMe, deleteMe} = require('../controller/userController')

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-my-password',protect, updatePassword);
router.patch('/update-me',protect, updateMe);
router.delete('/delete-me',protect, deleteMe);


router.route('/').get(getAllUser);

module.exports = router;