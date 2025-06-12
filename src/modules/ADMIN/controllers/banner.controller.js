const banners = require("../../models/banner.model");
const { validationResult } = require("express-validator");
const bannerService=require("../services/banner.service")
const {
  bannersSingleCollection,
} = require("../collection/bannerCollection");
const responseHandler = require("../../helper/response");


//////////////////////////////////////// Get All Banners (With Pagination, Excluding Soft Deleted)////////////////////////////////////////////
exports.getRecords = async (req, res) => {
  try {
    const data=await bannerService.get(req)
    return responseHandler.success(res, "Banners list",data);
  } catch (error) {
    return responseHandler.error(res, error.message);
  }
};
///////////////////////////////////////////////////////Create Banner///////////////////////////////////////////////////////////////////
exports.createRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler.badRequest(res, "Validation error", errors.array());
    }
    const data=await bannerService.add(req)// service.banner	
    return responseHandler.created(res, "Banners created successfully", data);
  } catch (error) {
    console.log(error)
    return responseHandler.error(res, error.message);
  }
};
/////////////////////////////////////////////////////Get Single Banner by ID ///////////////////////////////////////////////////////////////////
exports.getRecordById = async (req, res) => {
  try {
    const record = await banners.findById(req.params.id);
    if (!record) {
      return responseHandler.notFound(res, "Banner not found");
    }
    if (record.isDeleted) {
      return responseHandler.badRequest(res, "Banner is soft deleted");
    }
    return responseHandler.success( res, "Banner viewed successfully", bannersSingleCollection(record)
    );
  } catch (error) {
    console.log(error)
    return responseHandler.error(res, error.message);
  }
};
/////////////////////////////////////////////////////////Update Banner///////////////////////////////////////////////////////////////////     
exports.updateRecord = async (req, res) => {
  try {
      const result = await bannerService.update(req);

      if (result.error) {
          return responseHandler.notFound(res, result.error, result.statusCode);
      }

      return responseHandler.success(res, "Banner updated successfully", result.data);
  } catch (error) {
      return responseHandler.error(res, error.message);
  }
};	
///////////////////////////////////////////////////////// Soft Delete Banner//////////////////////////////////////////////////////////////
exports.softDeleteRecord = async (req, res) => {
  try {
    const record = await banners.findById(req.params.id);
    if (!record) {
      return responseHandler.notFound(res, "Banner not found");
    }
    if (record.isDeleted) {
      return responseHandler.badRequest(res, "Banner is already soft deleted");
    }
    record.isDeleted = true;
    record.deletedAt = new Date();
    await record.save();
    return responseHandler.success(
      res,
      "Banner soft deleted successfully",
      bannersSingleCollection(record)
    );
  } catch (error) {
    console.log(error)
    return responseHandler.error(res, error.message);
  }
};
/////////////////////////////////////////////////// Restore Soft Deleted Banner////////////////////////////////////////////////////////////
exports.restoreRecord = async (req, res) => {
  try {
    const record = await banners.findById(req.params.id);
    if (!record) {
      return responseHandler.notFound(res, "Banner not found");
    }
    if (!record.isDeleted) {
      return responseHandler.badRequest(res, "Banner is already restored");
    }
    record.isDeleted = false;
    record.deletedAt = null;
    await record.save();
    return responseHandler.success(
      res,
      "Banner restored successfully",
      bannersSingleCollection(record)
    );
  } catch (error) {
    console.log(error)
    return responseHandler.error(res, error.message);
  }
};


