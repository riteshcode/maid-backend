const CleaningService = require("../../models/cleaning-service.model");
const { validationResult } = require("express-validator");
const logger = require("../../../utils/logger");
const {
  cleaningServiceCollection,
  cleaningServiceSingleCollection,
} = require("../collection/CleaningServiceCollection");

// Get All Users (With Pagination, Excluding Soft Deleted)
exports.getRecords = async (req, res) => {
  try {
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1; // Default to page 1
    limit = parseInt(limit) || 50; // Default limit 10

    const skip = (page - 1) * limit;

    // Construct search filters
    let query = { };

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },  // Case-insensitive search by name
        { description: { $regex: new RegExp(search, "i") } }  // Case-insensitive search by email
      ];
    }


    const totalRecords = await CleaningService.countDocuments(query);

    const records = await CleaningService.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }).lean(); // Sort by latest records

    res.status(200).json({
      status: true,
      message: "Cleaning service list",
      data: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        records: cleaningServiceCollection(records),
      },
    });
  } catch (error) {
    logger.error(`CleaningServiceController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Create User
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

    const record = new CleaningService(req.body);
    await record.save();
    res
      .status(201)
      .json({ status: true, message: "Cleaning service created successfully", data: cleaningServiceSingleCollection(record) });
  } catch (error) {
    logger.error(`CleaningServiceController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Get Single User by ID
exports.getRecordById = async (req, res) => {
  try {
    const record = await CleaningService.findById(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaning service not found", data: null });
    }
    res.status(200).json({
      status: true,
      message: "Cleaning service view successfully",
      data: cleaningServiceSingleCollection(record),
    });
  } catch (error) {
    logger.error(`CleaningServiceController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
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

    const updatedRecord = await CleaningService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRecord) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaning service not found", data: null });
    }
    res.status(200).json({
      status: true,
      message: "Cleaning service updated successfully",
      data: cleaningServiceSingleCollection(updatedRecord),
    });
  } catch (error) {
    logger.error(`CleaningServiceController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Soft Delete User
exports.softDeleteRecord = async (req, res) => {
  try {
    const record = await CleaningService.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaning service not found", data: null });
    }
    res
      .status(200)
      .json({ status: true, message: "Cleaning service soft deleted", data: cleaningServiceSingleCollection(record) });
  } catch (error) {
    logger.error(`CleaningServiceController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Restore Soft Deleted User
exports.restoreRecord = async (req, res) => {
  try {
    const record = await CleaningService.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaning service not found", data: null });
    }
    res
      .status(200)
      .json({ status: true, message: "Cleaning service restored", data: cleaningServiceSingleCollection(record) });
  } catch (error) {
    logger.error(`CleaningServiceController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Permanently Delete User
exports.permanentDeleteRecord = async (req, res) => {
  try {
    const record = await CleaningService.findByIdAndDelete(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Cleaning service not found", data: null });
    }
    res
      .status(200)
      .json({ status: true, message: "Cleaning service permanently deleted", data: cleaningServiceSingleCollection(record) });
  } catch (error) {
    logger.error(`CleaningServiceController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
