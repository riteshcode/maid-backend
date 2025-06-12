
const Jobs = require("../../models/jobs.model");
const responseHandler = require("../../helper/response");
const {jobCollection} = require("../../API/customers/collection/jobsCollection");

// Models/dashboard Counts 
const Subscription = require('../../models/subscription-plan.model');
const CleaningCategory = require('../../models/cleaning-category.model');
const Cleaners = require('../../models/cleaners.model');
const Users = require('../../models/user.model');


exports.getDasboardCounts = async (req, res) => {
    try {
      const [subscriptionCounts, categoryCounts, cleanerCounts, userCounts] = await Promise.all([
        Subscription.aggregate([
          {
            $match: {
              status: { $ne: null, $exists: true }
            }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),
        CleaningCategory.aggregate([
          {
            $match: {
              status: { $ne: null, $exists: true }
            }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),
        Cleaners.aggregate([
          {
            $match: {
              status: { $ne: null, $exists: true }
            }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),
        Users.aggregate([
          {
            $match: {
              status: { $ne: null, $exists: true }
            }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ])
      ]);
  
      const result = {
        subscriptions: {
          Active: subscriptionCounts.find(item => item._id === 'Active')?.count || 0,
          Pending: subscriptionCounts.find(item => item._id === 'Pending')?.count || 0,
          Inactive: subscriptionCounts.find(item => item._id === 'Inactive')?.count || 0,
          total: subscriptionCounts.reduce((acc, curr) => acc + curr.count, 0)
        },
        categories: {
          Active: categoryCounts.find(item => item._id === 'Active')?.count || 0,
          Pending: categoryCounts.find(item => item._id === 'Pending')?.count || 0,
          Inactive: categoryCounts.find(item => item._id === 'Inactive')?.count || 0,
          total: categoryCounts.reduce((acc, curr) => acc + curr.count, 0)
        },
        cleaners: {
          Active: cleanerCounts.find(item => item._id === 'Active')?.count || 0,
          Pending: cleanerCounts.find(item => item._id === 'Pending')?.count || 0,
          Inactive: cleanerCounts.find(item => item._id === 'Inactive')?.count || 0,
          total: cleanerCounts.reduce((acc, curr) => acc + curr.count, 0)
        },
        users: {
          Active: userCounts.find(item => item._id === 'Active')?.count || 0,
          Pending: userCounts.find(item => item._id === 'Pending')?.count || 0,
          Inactive: userCounts.find(item => item._id === 'Inactive')?.count || 0,
          total: userCounts.reduce((acc, curr) => acc + curr.count, 0)
        }
      };
  
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };


//////////--------Job Listing --------------------------------------------
  // Get All Subscriptions (With Pagination, Excluding Soft Deleted)
exports.getAllJobListing = async (req,res)=>{

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

      const totalRecords = await Jobs.countDocuments(query);

      const records = await Jobs.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ [sortCol]: sortColDir })
          .lean(); // Sort by latest records

      const formatList = await jobCollection(records);
      return responseHandler.success(res, "Record List", {
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
          currentPage: page,
          sort: sortCol,
          sortDir: sortColDir ? "asc" : "desc",
          records: formatList,
      });
  } catch (error) {
      return responseHandler.error(res, error.message);
  }
};

