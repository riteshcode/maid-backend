const CleaningCategory = require("../../models/cleaning-category.model");
const { validationResult } = require("express-validator");
const logger = require("../../../utils/logger");
const {
  cleaningCategoryCollection,
  cleaningCategorySingleCollection,
} = require("../collection/CleaningCategoryCollection");
const { fileUploadHandler } = require("../../helper/uploadHelper");




/////////////// Get All Users (With Pagination, Excluding Soft Deleted)////////////////////////
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
        { description: { $regex: new RegExp(search, "i") } }, // Case-insensitive search by email
      ];
    }

    if (status) {
      query.status = status; // Exact match for status
    }

    const totalRecords = await CleaningCategory.countDocuments(query);

    const records = await CleaningCategory.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortCol]: sortColDir })
      .lean(); // Sort by latest records

    // attach image url in collection
    const formatterList = await cleaningCategoryCollection(records);

    res.status(200).json({
      status: true,
      message: "CleaningCategory list",
      data: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        records: formatterList,
      },
    });
  } catch (error) {
    logger.error(
      `CleaningCategoryController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
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

    const record = new CleaningCategory(req.body);

    // image upload to right folder
    const categoryImage = req.body.categoryImage;
    if (
      categoryImage &&
      (categoryImage !== null ||
        categoryImage !== "" ||
        categoryImage !== undefined)
    ) {
      await fileUploadHandler(categoryImage, "cleaningCategory");
    }

    await record.save();

    const formatter = await cleaningCategorySingleCollection(record);

    res
      .status(201)
      .json({
        status: true,
        message: "Created successfully",
        data: formatter,
      });
  } catch (error) {
    logger.error(
      `CleaningCategoryController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Get Single User by ID
exports.getRecordById = async (req, res) => {
  try {
    const record = await CleaningCategory.findById(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "CleaningCategory not found", data: null });
    }
    
    const formatter = await cleaningCategorySingleCollection(record);

    res.status(200).json({
      status: true,
      message: "CleaningCategory view successfully",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `CleaningCategoryController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
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
    // image upload to right folder
    const categoryImage = req.body.categoryImage;
    if (
      categoryImage &&
      (categoryImage !== null ||
        categoryImage !== "" ||
        categoryImage !== undefined)
    ) {
      await fileUploadHandler(categoryImage, "cleaningCategory");
    }
    
    const updatedRecord = await CleaningCategory.findByIdAndUpdate(
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
        .json({ status: false, message: "Claeaning category not found", data: null });
    }
    
    const formatter = await cleaningCategorySingleCollection(updatedRecord);

    res.status(200).json({
      status: true,
      message: "Cleaning category updated successfully",
      data: formatter,
    });
  } catch (error) {
    logger.error(
      `Claeaning categorysController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Soft Delete User
exports.softDeleteRecord = async (req, res) => {
  try {
    const record = await CleaningCategory.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "CleaningCategory not found", data: null });
    }

    
    const formatter = await cleaningCategorySingleCollection(record);
    res
      .status(200)
      .json({
        status: true,
        message: "Category soft deleted",
        data: formatter,
      });
  } catch (error) {
    logger.error(
      `CleaningCategoryController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Restore Soft Deleted User
exports.restoreRecord = async (req, res) => {
  try {
    const record = await CleaningCategory.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "CleaningCategory not found", data: null });
    }

    const formatter = await cleaningCategorySingleCollection(record);
    res
      .status(200)
      .json({
        status: true,
        message: "CleaningCategory restored",
        data: formatter,
      });
  } catch (error) {
    logger.error(
      `CleaningCategoryController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Permanently Delete User
exports.permanentDeleteRecord = async (req, res) => {
  try {
    const record = await CleaningCategory.findByIdAndDelete(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "CleaningCategory not found", data: null });
    }
    
    const formatter = await cleaningCategorySingleCollection(record);
    res
      .status(200)
      .json({
        status: true,
        message: "CleaningCategory permanently deleted",
        data: formatter,
      });
  } catch (error) {
    logger.error(
      `CleaningCategoryController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};


