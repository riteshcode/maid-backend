const User = require("../../models/user.model");
const { validationResult } = require("express-validator");
const logger = require("../../../utils/logger");
const {
  userCollection,
  userSingleCollection,
} = require("../collection/UserCollection");
const { fileUploadHandler } = require("../../helper/uploadHelper");
const dayjs = require("dayjs"); //import dayjs from 'dayjs' // ES 2015
const SubscriptionPlanModel = require("../../models/subscription-plan.model");

// if plan choosen add expiry date
const todayDateObj = dayjs();

/////////////////// Get All Users (With Pagination, Excluding Soft Deleted)////////////////////////////
exports.getRecords = async (req, res) => {
  try {
    let { page, limit, search, status, sort, sortDir } = req.query;

    page = parseInt(page) || 1; // Default to page 1
    limit = parseInt(limit) || 50; // Default limit 10

    const skip = (page - 1) * limit;

    // Construct search filters
    let query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } }, // Case-insensitive search by name
        { email: { $regex: new RegExp(search, "i") } }, // Case-insensitive search by email
      ];
    }

    let sortCol = sort || "_id";
    let sortColDir = (sortDir || "asc") == "asc" ? 1 : -1;

    if (status) {
      query.status = status; // Exact match for status
    }

    const totalRecords = await User.countDocuments(query);

    const records = await User.find(query)
      .populate({ path: "plan", select: { name: 1, description: 1 } })
      .skip(skip)
      .limit(limit)
      .sort({ [sortCol]: sortColDir });
      // .lean({ virtuals: true }); // Sort by latest records

    const formattedRecord = await userCollection(records);

    res.status(200).json({
      status: true,
      message: "User list",
      data: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        sort: sortCol,
        sortDir: sortColDir ? "asc" : "desc",
        records: formattedRecord,
      },
    });
  } catch (error) {
    logger.error(
      `UserController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Create Record
exports.createRecord = async (req, res) => {
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

    const { name, email, mobile, password, status, plan } = req.body;

    const record = new User({ name, email, mobile, password, status, plan });

    // image upload to right folder
    const profileImage = req.body.profileImage;
    if (
      profileImage &&
      (profileImage !== null ||
        profileImage !== "" ||
        profileImage !== undefined)
    ) {
      await fileUploadHandler(profileImage, "users");
    }

    // find plan info and add epiry dates.
    if (req.body.plan) {
      const planInfo = await SubscriptionPlanModel.findById(req.body.plan);
      if (planInfo) {
        const planTunure = planInfo.planTenure == "monthly" ? "month" : "year";
        record.isPlanActive = true;
        record.planExpiredDate = todayDateObj.add(1, planTunure).toDate(); // add 1 month or year
        console.log("record.planExpiredDate", record.planExpiredDate);
      }
    }

    await record.save();

    const formatter = await userSingleCollection(record);

    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `UserController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Get Single Record by ID
exports.getRecordById = async (req, res) => {
  try {
    const record = await User.findById(req.params.id).populate({
      path: "plan",
    });
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "User not found", data: null });
    }

    const formatter = await userSingleCollection(record);

    res.status(200).json({
      status: true,
      message: "User view successfully",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `UserController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Update record
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
      await fileUploadHandler(profileImage, "users");
    }

    const { name, email, mobile, status, plan } = req.body;
    const recordUpdate = { name, email, mobile, status, plan };

    // find plan info and add epiry dates.
    const OldUserInfo = await User.findById(req.params.id);

    if (req.body.plan && OldUserInfo.plan != req.body.plan) {
      const planInfo = await SubscriptionPlanModel.findById(req.body.plan);
      if (planInfo) {
        const planTunure = planInfo.planTenure == "monthly" ? "month" : "year";
        recordUpdate.isPlanActive = true;
        recordUpdate.planExpiredDate = todayDateObj.add(1, planTunure).toDate(); // add 1 month or year
        console.log("record.planExpiredDate", recordUpdate.planExpiredDate);
      }
    }

    const updateRecord = await User.findByIdAndUpdate(
      req.params.id,
      recordUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateRecord) {
      return res
        .status(404)
        .json({ status: false, message: "User not found", data: null });
    }

    const formatter = await userSingleCollection(updateRecord);
    res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `UserController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Soft Delete Record
exports.softDeleteRecord = async (req, res) => {
  try {
    const record = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "User not found", data: null });
    }

    const formatter = await userSingleCollection(record);

    res.status(200).json({
      status: true,
      message: "User soft deleted",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `UserController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Restore Soft Deleted Record
exports.restoreRecord = async (req, res) => {
  try {
    const recordExists = await User.findOne({ _id: req.params.id });
    logger.info(recordExists);

    const record = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    logger.info(record);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "User not found", data: null });
    }

    const formatter = await userSingleCollection(record);

    res.status(200).json({
      status: true,
      message: "User restored",
      data: record,
    });
  } catch (error) {
    logger.error(
      `UserController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Permanently Delete Record
exports.permanentDeleteUserRecord = async (req, res) => {
  try {
    const record = await User.findByIdAndDelete(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "User not found", data: null });
    }

    const formatter = await userSingleCollection(record);

    res.status(200).json({
      status: true,
      message: "User permanently deleted",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `UserController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
