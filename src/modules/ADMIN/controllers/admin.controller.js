const AdminService = require('../services/admin.service');

exports.register = async (req, res) => {
    try {
        const user = await AdminService.register(req.body);
        res.status(201).json({ message: 'User registered', user });
    } catch (error) {
        res.status(200).json({ status : false, message: error.message, data:null  });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await AdminService.login(req.body.email, req.body.password);
        console.log('Login user', user);
        res.status(200).json({ status : true, message: 'Login successful', data : user });
    } catch (error) {
        res.status(200).json({ status : false, message: error.message, data:null  });
    }
};