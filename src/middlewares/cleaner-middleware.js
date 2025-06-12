const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.CleanerMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ status:false, message: 'Access denied' });
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_ADMIN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ status:false, message: 'Token expire' });
    }
};