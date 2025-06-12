const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin.model');

exports.register = async (userData) => {
    const { name, email, password } = userData;
    const existingUser = await Admin.findOne({ email });
    if (existingUser) throw new Error('User already exists');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Admin({ name, email, password: hashedPassword });
    await user.save();
    return user;
};

exports.login = async (email, password) => {
    const user = await Admin.findOne({ email });
    if (!user) throw new Error('Invalid email or password');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_ADMIN_SECRET, { expiresIn: '5h' });
    user.token = token;
    console.log('Login suer with token', user, token);
    return user;
};