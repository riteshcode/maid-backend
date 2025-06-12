const SubscriptionPlan = require("../../models/subscription-plan.model");
const { validationResult } = require("express-validator");
const logger = require("../../../utils/logger");
const {
    subscriptionCollection,
  subscriptionSingleCollection,
} = require("../collection/SubscriptionsCollection");
const { fileUploadHandler } = require("../../helper/uploadHelper");

//////////////////////// Get All Subscriptions (With Pagination, Excluding Soft Deleted)/////////////////////////
exports.getSubscriptions = async (req, res) => {
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
        { description: { $regex: new RegExp(search, "i") } }, // Case-insensitive search by email
      ];
    }

    let sortCol = sort || "_id";
    let sortColDir = (sortDir || "asc") == "asc" ? 1 : -1;

    if (status) {
      query.status = status; // Exact match for status
    }

    const totalRecords = await SubscriptionPlan.countDocuments(query);

    const records = await SubscriptionPlan.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortCol]: sortColDir })
      .lean(); // Sort by latest records

    const formatList = await subscriptionCollection(records);
    res.status(200).json({
      status: true,
      message: "Record List",
      data: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        sort: sortCol,
        sortDir: sortColDir ? "asc" : "desc",
        records: formatList,
      },
    });
  } catch (error) {
    logger.error(
      `SubscriptionPlanController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Create Subscriptions
exports.createSubscriptions = async (req, res) => {
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

    const record = new SubscriptionPlan(req.body);

    // image upload to right folder
    const planImage = req.body.planImage;
    if (
      planImage &&
      (planImage !== null ||
        planImage !== "" ||
        planImage !== undefined)
    ) {
      await fileUploadHandler(planImage, "subscriptions");
    }


    await record.save();

    const format = await subscriptionSingleCollection(record);

    res
      .status(201)
      .json({
        status: true,
        message: "Subscription Plan created successfully",
        data: format,
      });
  } catch (error) {
    logger.error(
      `SubscriptionPlanController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Get Single Subscriptions by ID
exports.getSubscriptionsById = async (req, res) => {
  try {
    const record = await SubscriptionPlan.findById(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Subscription Plan not found", data: null });
    }
    const formatRecord = await subscriptionSingleCollection(record);

    res.status(200).json({
      status: true,
      message: "Subscription Plan view successfully",
      data: formatRecord,
    });
  } catch (error) {
    logger.error(
      `SubscriptionPlanController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Update Subscriptions
exports.updateSubscriptions = async (req, res) => {
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
    const planImage = req.body.planImage;
    if (
      planImage &&
      (planImage !== null ||
        planImage !== "" ||
        planImage !== undefined)
    ) {
      await fileUploadHandler(planImage, "subscriptions");
    }

    const record = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Subscription Plan not found", data: null });
    }

    const formatRecord = await subscriptionSingleCollection(record);

    res.status(200).json({
      status: true,
      message: "Subscription Plan updated successfully",
      data: formatRecord,
    });
  } catch (error) {
    logger.error(
      `SubscriptionPlanController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
// Soft Delete Subscriptions
exports.softDeleteSubscriptions = async (req, res) => {
  try {
    const record = await SubscriptionPlan.findByIdAndUpdate(
      {_id: req.params.id,isDeleted:true},
      { isDeleted: false, deletedAt: new Date() },
      { new: true }
    );
    logger.info(record);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Subscription Plan not found", data: null });
    } 
    const formatRecord = await subscriptionSingleCollection(record);
    res
      .status(200)
      .json({
        status: true,
        message: "Subscription Plan soft deleted",
        data: formatRecord,
      });
  } catch (error) {
    logger.error(
      `SubscriptionPlanController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
// Restore Soft Deleted Subscriptions
exports.restoreSubscriptions = async (req, res) => {
  try {
    const recordExists = await SubscriptionPlan.findOne({ _id: req.params.id });
    logger.info(recordExists);
    const record = await SubscriptionPlan.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    logger.info(record);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "record not found", data: null });
    }
    const formatRecord = await subscriptionSingleCollection(record);
    res
      .status(200)
      .json({
        status: true,
        message: "Record restored",
        data: formatRecord,
      });
  } catch (error) {
    logger.error(
      `SubscriptionPlanController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Permanently Delete Subscriptions
exports.permanentDeleteSubscriptions = async (req, res) => {
  try {
    const record = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Subscription Plan not found", data: null });
    }
    
    const formatRecord = await subscriptionSingleCollection(record);

    res
      .status(200)
      .json({
        status: true,
        message: "Subscription Plan permanently deleted",
        data: formatRecord,
      });
  } catch (error) {
    logger.error(
      `SubscriptionPlanController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
