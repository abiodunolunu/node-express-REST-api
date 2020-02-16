const User = require('../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array()[0].msg)
        const error = new Error('Validation failed.');
        error.message = errors.array()[0].msg
        error.statusCode = 422;
        error.data = errors.array();
        throw error
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    console.log(email, name, password)
    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name
        });
        await user.save()
        res.status(201).json({
            message: 'User created',
            userId: user._id
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;

    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            const error = new Error('This email is not registered');
            error.statusCode = 401;
            throw error
        }
        loadedUser = user
        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'supersecret',
            { expiresIn: '1h' }
        )

        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString(),
            user: loadedUser.name
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
};