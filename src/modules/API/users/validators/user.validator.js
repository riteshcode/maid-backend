const { body, validationResult } = require('express-validator');

exports.validateRegister = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        console.log('errors', errors);
        if (!errors.isEmpty()) {
            return res.status(400).json({ validationErrors: errors.array() });
        }
        next();
    }
];

exports.validateLogin = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ validationErrors: errors.array() });
        }
        next();
    }
];