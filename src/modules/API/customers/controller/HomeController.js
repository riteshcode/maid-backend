const { validationResult } = require("express-validator");
const HomeService = require("../services/HomeService");
const logger = require("../../../../utils/logger");

// Home Screen
exports.getHomeData = async (req, res) => {
  try {
    const response = await HomeService.getHomeDataService(req);
    return res.status(200).json({
      success: true,
      message: "List",
      data: response,
    });
  } catch (err) {
    logger.error(
      `API: HomeController : GetHomeData() - Error: ${err.message}`
    );
    return res.status(500).json({
      success: false,
      message: err.message || err,
      data: null,
    });
  }
};

// Worker Bees Filter List Data
exports.getWorkerBeesFilterList = async (req, res) => {
  try {
    const response = await HomeService.getWorkerBeesFilterListService(req);
    return res.status(200).json({
      success: true,
      message: "Worker Bees Filter List",
      data: response,
    });
  } catch (err) {
    logger.error(
      `API: HomeController : getWorkerBeesFilterList() - Error: ${err.message}`
    );
    return res.status(500).json({
      success: false,
      message: err.message || err,
      data: null,
    });
  }
};
// Worker Bees List
exports.getWorkerBeesList = async (req, res) => {
  try {
    const response = await HomeService.getWorkerBeesListService(req);
    return res.status(200).json({
      success: true,
      message: "List",
      data: response,
    });
  } catch (err) {
    logger.error(
      `API: HomeController : getWorkerBeesList() - Error: ${err.message}`
    );
    return res.status(500).json({
      success: false,
      message: err.message || err,
      data: null,
    });
  }
};

// Worker Bees Deailt API List
exports.getWorkerBeesDetails = async (req, res) => {
  try {
    const response = await HomeService.getWorkerBeesDetailsService(req);
    return res.status(200).json({
      success: true,
      message: "Get Worker Bees Details",
      data: response,
    });
  } catch (err) {
    logger.error(
      `API: HomeController : getWorkerBeesDetails() - Error: ${err.message}`
    );
    return res.status(500).json({
      success: false,
      message: err.message || err,
      data: null,
    });
  }
};

// getCommonListApi
exports.getCommonListApi = async (req, res) => {
  try {
    const response = await HomeService.getCommonListApiService(req);
    return res.status(200).json({
      success: true,
      message: "Get All Commond API List",
      data: response,
    });
  } catch (err) {
    logger.error(
      `API: HomeController : getCommonListApi() - Error: ${err.message}`
    );
    return res.status(500).json({
      success: false,
      message: err.message || err,
      data: null,
    });
  }
};

