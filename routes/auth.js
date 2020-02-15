const express = require('express');
const authController = require('../controllers/auth')
const { body } = require('express-validator');
const User = require('../models/User');
const router = express.Router();


router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email address already exists!');
                    }
                });
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 })
        .withMessage('password is too short'),
    body('name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Name cannot be empty')
], authController.signup)

router.post('/login', authController.login)


module.exports = router;