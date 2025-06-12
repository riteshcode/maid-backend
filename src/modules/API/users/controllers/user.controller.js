const UserService = require('../services/user.service');

exports.register = async (req, res) => {
    try {
        const user = await UserService.register(req.body);
        res.status(201).json({ message: 'User registered', user });
    } catch (error) {
        res.status(400).json({ catcherror: error });
    }
};

exports.login = async (req, res) => {
    try {
        const token = await UserService.login(req.body.email, req.body.password);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};