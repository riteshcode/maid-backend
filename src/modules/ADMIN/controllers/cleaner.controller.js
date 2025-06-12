const Cleaners = require("../../models/cleaners.model");
const { validationResult } = require("express-validator");
const logger = require("../../../utils/logger");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  CleanerCollection,
  cleanerSingleCollection,
} = require("../collection/CleanersCollection");
const { fileUploadHandler } = require("../../helper/uploadHelper");
const emailOtpModel = require("../../models/email-otp.model");
const CleanerService = require('../services/cleaner.service')
const CleaningServiceModel = require("../../models/cleaning-service.model");
const CleaningCategoryModel = require("../../models/cleaning-category.model");
const responseHandler = require("../../helper/response");


///////////////////////// Get All Users (With Pagination, Excluding Soft Deleted)/////////////////////////////////
exports.getRecords = async (req, res) => {
  try {
    let { page, limit, search, status, sort, sortDir } = req.query;
    page = parseInt(page) || 1; // Default to page 1
    limit = parseInt(limit) || 50; // Default limit 10

    const skip = (page - 1) * limit;

    // Construct search filters
    let query = {};

    let sortCol = sort || "_id";
    let sortColDir = (sortDir || "asc") == "asc" ? 1 : -1;

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } }, // Case-insensitive search by name
        { email: { $regex: new RegExp(search, "i") } }, // Case-insensitive search by email
      ];
    }

    if (status) {
      query.status = status; // Exact match for status
    }

    const totalRecords = await Cleaners.countDocuments(query);

    const records = await Cleaners.find(query)
      .populate([
        { path: "services", select: { name: 1 } },
        { path: "cleaningCategory", select: { name: 1 } },
      ])
      .skip(skip)
      .limit(limit)
      .sort({ [sortCol]: sortColDir })
      .lean(); // Sort by latest records

    // attach image url in collection
    const formatterList = await CleanerCollection(records);

    res.status(200).json({
      status: true,
      message: "Cleaner list",
      data: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        records: formatterList,
      },
    });
  } catch (error) {
    logger.error(
      `CleanersController - Request ${JSON.stringify(req.params)} Error: ${error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// User Login
exports.login = async (req, res) => {

  const { email, password } = req.body;
  try {
    const user = await Cleaners.findOne({ email });
    if (!user) {
      return responseHandler.badRequest(res, 'Invalid email or password');
    }
    if (user.status !== 'Active') {
      return responseHandler.Forbidden(res, ' Account is not Active contact to admin');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseHandler.badRequest(res, 'Incorrect Password');
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_CLEANER_SECRET, { expiresIn: '1h' });
    const formatter = await cleanerSingleCollection(user);
    return responseHandler.success(res, 'Login successful', { user: formatter, token: token },);
  } catch (err) {
    console.error(err);
    return responseHandler.error(res, error.message);
  }
};




exports.cleanerVerification = async (req, res) => {
  try {
    const { userId } = req.params.id;
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Active', 'In-Verification', 'Inactive'];
    if (!allowedStatuses.includes(status)) {
      return responseHandler.badRequest(res,'Invalid status value. Allowed: Pending, Active, In-Verification, Inactive');
    }
    const cleaner = await Cleaners.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!cleaner) {
      return responseHandler.notFound(res, 'Cleaner not found');
    }
    return responseHandler.success(res,'Cleaner status updated successfully', {  userId:cleaner._id,status:cleaner.status }
    );
  } catch (error) {
    return responseHandler.error(res, error.message);

  }
}
//Register Cleaner
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }

    // Hash the password					
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // Create new cleaner					
    const record = new Cleaners(req.body);

    // Handle profile image upload					
    const profileImage = req.body.profileImage;
    if (
      profileImage &&
      profileImage !== null &&
      profileImage !== "" &&
      profileImage !== undefined
    ) {
      await fileUploadHandler(profileImage, "cleaners");
    }

    await record.save();
    const formatter = await cleanerSingleCollection(record);

    res.status(201).json({
      status: true,
      message: "Cleaner created successfully",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `CleanersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Get Single User by ID
exports.createCleanersFilter = async (req, res) => {
  try {
    const cleaningServiceRecords = await CleaningServiceModel.find(
      {},
      { name: 1 }
    );

    const cleaningCategoryRecords = await CleaningCategoryModel.find(
      { status: "Active" },
      { name: 1 }
    );

    res.status(200).json({
      status: true,
      message: "Create Cleaners Filter",
      data: { cleaningServiceRecords, cleaningCategoryRecords },
    });
  } catch (error) {
    logger.error(
      `CleanersController - createCleanersFilter Request ${JSON.stringify(
        req.params
      )} Error: ${error.message}`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Get Single User by ID
exports.getRecordById = async (req, res) => {
  try {
    const record = await Cleaners.findById(req.params.id).populate([
      { path: "services", select: { name: 1 } },
      { path: "cleaningCategory", select: { name: 1 } },
    ]);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaner not found", data: null });
    }

    const formatter = await cleanerSingleCollection(record);

    res.status(200).json({
      status: true,
      message: "Cleaner view successfully",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `CleanersController - Request ${JSON.stringify(req.params)} Error: ${error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Update User
exports.updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }
    // image upload to right folder
    const profileImage = req.body.profileImage;
    if (
      profileImage &&
      (profileImage !== null ||
        profileImage !== "" ||
        profileImage !== undefined)
    ) {
      await fileUploadHandler(profileImage, "cleaners");
    }

    const updatedRecord = await Cleaners.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedRecord) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaner not found", data: null });
    }

    const formatter = await cleanerSingleCollection(updatedRecord);

    res.status(200).json({
      status: true,
      message: "Cleaner updated successfully",
      data: null
    });
  } catch (error) {
    logger.error(
      `CleanersController - Request ${JSON.stringify(req.params)} Error: ${error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Soft Delete User
exports.softDeleteRecord = async (req, res) => {
  try {
    const record = await Cleaners.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaner not found", data: null });
    }

    const formatter = await cleanerSingleCollection(record);
    res.status(200).json({
      status: true,
      message: "Cleaner soft deleted",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `CleanersController - Request ${JSON.stringify(req.params)} Error: ${error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Restore Soft Deleted User
exports.restoreRecord = async (req, res) => {
  try {
    const record = await Cleaners.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaner not found", data: null });
    }

    const formatter = await cleanerSingleCollection(record);
    res.status(200).json({
      status: true,
      message: "Cleaner restored",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `CleanersController - Request ${JSON.stringify(req.params)} Error: ${error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Permanently Delete User
exports.permanentDeleteRecord = async (req, res) => {
  try {
    const record = await Cleaners.findByIdAndDelete(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaner not found", data: null });
    }

    const formatter = await cleanerSingleCollection(record);
    res.status(200).json({
      status: true,
      message: "Cleaner permanently deleted",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `CleanersController - Request ${JSON.stringify(req.params)} Error: ${error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Forgot Password for cleaner
exports.forgotPasswordCleaner = async (req, res) => {
  const { email } = req.body;
  if (!email) return responseHandler.badRequest(res, 'Email is required');
  try {
    const user = await Cleaners.findOne({ email });
    if (!user) return responseHandler.notFound(res, 'User not found with this email');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await emailOtpModel.deleteMany({ email });
    await emailOtpModel.create({ email, otp, expiresAt });
    return responseHandler.success(res, "OTP sent. Please verify the OTP to reset password.", { otp, userId: user._id });
  } catch (error) {
    return responseHandler.error(res, 'Error In Sending Otp');
  }
};

//verify email for forgot password of cleaner
exports.verifyEmailOtpCleaner = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return responseHandler.badRequest(res, 'Email and OTP are required');
  }
  try {
    const user = await Cleaners.findOne({ email });
    if (!user) return responseHandler.notFound(res, 'User not found with this email');
    const record = await emailOtpModel.findOne({ email })
    if (!record) {
      return responseHandler.badRequest(res, 'Invalid or expired OTP');
    }
    if (record.expiresAt < new Date()) {
      await emailOtpModel.deleteOne({ _id: record._id });
      return responseHandler.badRequest(res, 'OTP expired. Please request a new one.');
    }
    await emailOtpModel.deleteOne({ _id: record._id });
    return responseHandler.success(res, 'OTP verified successfully. You can now reset your password.', { UserId: user._id });
  } catch (error) {
    return responseHandler.error(res, 'Otp verification Failed')
  }
};

//reset Password for cleanere
exports.resetPasswordCleaner = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.params.id;
  if (!newPassword) {
    return responseHandler.badRequest(res, 'New password is required');
  }
  try {
    const user = await Cleaners.findById(userId);

    if (!user) {
      return responseHandler.notFound(res, 'User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await Cleaners.findByIdAndUpdate({ _id: user?._id }, { password: hashedPassword })

    return responseHandler.success(res, 'Password reset successful');
  } catch (error) {
    return responseHandler.error(res, 'Failed to reset password');
  }
};

// change password 
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return responseHandler.badRequest(res, 'Both old and new passwords are required');
  }
  try {
    const userId = req.user._id;
    await CleanerService.changePassword(userId, oldPassword, newPassword);
    req.addTokenToBlacklist(req.token);
    return responseHandler.success(res, 'Password change successful', { userId });
  } catch (error) {
    if (error.message === 'Old password is incorrect') {
      return responseHandler.badRequest(res, 'Old password is incorrect');
    }

    return responseHandler.error(res, 'Failed to change password');
  }
};
