const {
  cleaningCategoryCollection,
} = require("../../../API/customers/collection/CleaningCategoryCollection");
const CleaningCategoryModel = require("../../../models/cleaning-category.model");
const cleaningServiceModel = require("../../../models/cleaning-service.model");
const CleanersModel = require("../../../models/cleaners.model");
const {
  cleaningServiceCollection,
  cleaningServiceSingleCollection,
} = require("../collection/CleaningServiceCollection");
const { CleanerCollection } = require("../collection/CleanersCollection");
const ReviewModel = require("../../../models/review.model");
const mongoose = require("mongoose");
const { reviewCollection } = require("../collection/ReviewCollection");
const SubscriptionPlanModel = require("../../../models/subscription-plan.model");
const {
  subscriptionCollection,
} = require("../collection/SubscriptionsCollection");

/**
 * Fetches and prepares data for the home screen, including:
 * - Top active cleaning categories
 * - Top cleaning services
 * - Top active cleaners (worker bees)
 *
 * Each list is formatted using its corresponding collection formatter.
 *
 * @param {Object} req - The Express request object.
 *
 * @returns {Promise<Object>} An object containing:
 *  - categoryList {Array<Object>} - List of formatted active cleaning categories (max 10)
 *  - cleaningServiceList {Array<Object>} - List of formatted cleaning services (max 10)
 *  - worker {Array<Object>} - List of formatted active cleaners (max 10)
 */

async function getHomeDataService(req) {
  const obj = {};

  // Fetch active categories
  const categoryList = await CleaningCategoryModel.find({
    status: "Active",
  })
    .sort({ name: 1 })
    .limit(10);
  obj["categoryList"] = await cleaningCategoryCollection(categoryList);

  // Fetch all cleaning services
  const cleaningServiceList = await cleaningServiceModel
    .find()
    .sort({ name: 1 })
    .limit(10);
  obj["cleaningServiceList"] = cleaningServiceCollection(cleaningServiceList);

  // Fetch active cleaners (limit 10)
  const records = await CleanersModel.find({ status: "Active" })
    .limit(10)
    .sort({ name: 1 });

  // Format cleaner list with image URLs
  const cleanerList = await CleanerCollection(records);
  obj["worker"] = cleanerList;

  return obj;
}

/**
 * Fetches a paginated list of active cleaners ("worker bees") based on various filters.
 *
 * Filters supported:
 * - Zip code (partial match)
 * - Hourly pay rate range
 * - Services offered
 * - Cleaning categories
 *
 * Also returns the total record count and total pages for pagination,
 * and populates service and category references in each cleaner record.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body.
 * @param {number} [req.body.page=1] - The current page number for pagination.
 * @param {number} [req.body.limit=50] - The number of records per page.
 * @param {string} [req.body.zipcode] - A zip code to filter cleaners by (partial match).
 * @param {number[]} [req.body.pay_rate] - An array with two numbers [min, max] for hourly rate filtering.
 * @param {string[]} [req.body.categories] - An array of cleaning category IDs to filter by.
 * @param {string[]} [req.body.services] - An array of service IDs to filter by.
 *
 * @returns {Promise<Object>} A paginated response object containing:
 *  - totalRecords {number} - Total number of matching cleaners
 *  - totalPages {number} - Total pages available
 *  - currentPage {number} - Current page number
 *  - records {Array<Object>} - List of formatted cleaner records with services and categories populated
 */

async function getWorkerBeesListService(req) {
  let { page, limit, zipcode, pay_rate, categories, services } = req.body;
  page = parseInt(page) || 1; // Default to page 1
  limit = parseInt(limit) || 50; // Default limit 10

  const skip = (page - 1) * limit;

  // Construct search filters
  let query = {};

  let sortCol = "_id";
  let sortColDir = 1;

  // find by zipcode match
  if (zipcode) {
    query.zipcode = { $regex: new RegExp(zipcode, "i") };
  }

  // BETWEEN hourly rate
  if (Array.isArray(pay_rate) && pay_rate.length === 2) {
    query.hourlyRate = {
      $gte: Number(pay_rate[0]) || 0,
      $lte: Number(pay_rate[1]) || 1000,
    };
  }

  query.status = "Active"; // Exact match for status

  // service filter
  if (Array.isArray(services) && services.length > 0) {
    query.services = { $in: services };
  }

  // category filter
  if (Array.isArray(categories) && categories.length > 0) {
    query.cleaningCategory = { $in: categories };
  }

  const totalRecords = await CleanersModel.countDocuments(query);

  const records = await CleanersModel.find(query)
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
  return {
    totalRecords,
    totalPages: Math.ceil(totalRecords / limit),
    currentPage: page,
    records: formatterList,
  };
}

/**
 * Retrieves filter options for worker bees listing page.
 *
 * This function fetches:
 * - All cleaning services (only their names)
 * - All active cleaning categories (only their names)
 *
 * @param {Object} req - The Express request object.
 * @returns {Promise<Object>} An object containing:
 *  - cleaningServiceRecords: Array of cleaning services (name only)
 *  - cleaningCategoryRecords: Array of active cleaning categories (name only)
 */

async function getWorkerBeesFilterListService(req) {
  const cleaningServiceRecords = await cleaningServiceModel.find(
    {},
    { name: 1 }
  );

  const cleaningCategoryRecords = await CleaningCategoryModel.find(
    { status: "Active" },
    { name: 1 }
  );

  return { cleaningServiceRecords, cleaningCategoryRecords };
}

/**
 * Get detailed information for a specific cleaner (Worker Bee), including their
 * profile, services, cleaning categories, and paginated customer reviews.
 *
 * @async
 * @function getWorkerBeesDetailsService
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.beesId - The ID of the cleaner (Worker Bee).
 * @param {Object} req.body - The request body.
 * @param {number} [req.body.page=1] - The page number for paginated reviews.
 * @param {number} [req.body.limit=50] - The number of reviews per page.
 * @returns {Promise<Object>} An object containing:
 *  - singleRecords: Detailed cleaner information with services and categories.
 *  - reviews: Paginated reviews with user info (name, profileImage).
 *
 * @throws {Error} Throws if any database query fails.
 */

async function getWorkerBeesDetailsService(req) {
  const { beesId } = req.params;
  let { page, limit } = req.body; // pagination for reviews
  page = parseInt(page) || 1; // Default to page 1
  limit = parseInt(limit) || 50; // Default limit 10

  // Construct search filters
  const skip = (page - 1) * limit;
  let query = {};
  let sortCol = "_id";
  let sortColDir = 1;
  const totalRecords = await ReviewModel.countDocuments(beesId);

  query.cleanerInfo = beesId;
  const reviewResp = await ReviewModel.find(query)
    .populate([{ path: "userInfo", select: { name: 1, profileImage: 1 } }])
    .skip(skip)
    .limit(limit)
    .sort({ [sortCol]: sortColDir })
    .lean(); // Sort by latest records

  const records = await CleanersModel.findById(beesId).populate([
    { path: "services", select: { name: 1 } },
    { path: "cleaningCategory", select: { name: 1 } },
  ]);

  // attach image url in collection
  const singleRecords = await cleaningServiceSingleCollection(records);

  const reviewList = await reviewCollection(reviewResp);

  return {
    singleRecords,
    reviews: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      records: reviewList,
    },
  };
}

async function getCommonListApiService(req) {
  const { dataType } = req.body;


  const cleaningServiceList = await cleaningServiceModel.find({});
  const cleaningService = await cleaningServiceCollection(
    cleaningServiceList
  );

  // cleaningCategoryCollection
  const cleaningCategoryList = await CleaningCategoryModel.find({
    status: "Active",
  });
  const cleaningCategory = await cleaningCategoryCollection(
    cleaningCategoryList
  );

  // subcription list
  const SubscriptionPlanList = await SubscriptionPlanModel.find({
    status: "Active",
  });
  const subscriptionPlan = await subscriptionCollection(
    SubscriptionPlanList
  );

  return {
    cleaningService,
    cleaningCategory,
    subscriptionPlan,
  };
}

module.exports = {
  getHomeDataService,
  getWorkerBeesListService,
  getWorkerBeesFilterListService,
  getWorkerBeesDetailsService,
  getCommonListApiService,
};
