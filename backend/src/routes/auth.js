const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @body    { email, password, confirmPassword }
 * @returns { token, user }
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @body    { email, password }
 * @returns { token, user }
 */
router.post('/login', login);

module.exports = router;
