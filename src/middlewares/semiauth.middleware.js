const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


// token is not a mandoryt on some api.
exports.semiAuthMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (token){
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
    }else{
        req.user = '';
    }

    next();
};