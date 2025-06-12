const { validationResult } = require("express-validator");
const Jobs = require("../../../models/jobs.model");
const jobService = require("../services/jobsService");
const User = require("../../../models/user.model");
const Cleaner = require("../../../models/cleaners.model");
const CleaningService = require("../../../models/cleaning-service.model");
const responseHandler = require("../../../helper/response");
const {
    jobCollection,
    jobSingleCollection,
} = require("../collection/jobsCollection");

// Get All Subscriptions (With Pagination, Excluding Soft Deleted)
exports.getAllJobs = async (req, res) => {
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
// Create a new Job
exports.createJob = async (req, res) => {
   
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
        const { userId, CleanerId, CleaningServiceId } = req.body;
        if (!userId || !CleanerId || !CleaningServiceId) {
            return res.status(400).json({
                success: false,
                message: "User ID, Cleaner ID, and Cleaning Service ID are required",
            });
        }
        const userExists = await User.findById(userId);
        if (!userExists) {
            return responseHandler.notFound(res, "User not found");
        }
        const cleanerExists = await Cleaner.findById(CleanerId);
        if (!cleanerExists) {
            return responseHandler.notFound(res, "Cleaner not found");
        }
        const cleaningServiceExists = await CleaningService.findById(
            CleaningServiceId
        ); // Check if Cleaning Service exists
        if (!cleaningServiceExists) {
            return responseHandler.notFound(res, "Cleaning Service not found");
        }
        const job = await jobService.createJob(req.body); // Create Job
        return responseHandler.created(res, "Job created successfully", { data: job });
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error.message);
    }
};

// Get Job by ID
exports.getJobById = async (req, res) => {
    try {
        const record = await Jobs.findById(req.params.id);
        if (!record) {
            return responseHandler.notFound(res, "job not found");
        }
        if (record.isDeleted) {
            return responseHandler.badRequest(res, "job is soft deleted");
        }
        const formatter = await jobSingleCollection(record);
        return responseHandler.success(res, "job viewed successfully", {
            data: formatter,
        });
    } catch (error) {
        console.log(error);
        return responseHandler.error(res, error.message);
    }
};
// Update Job
exports.updateJob = async (req, res) => {
    try {
        const updatedJob = await jobService.updateJob(req.params.id, req.body);
        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            data: updatedJob,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//soft deleted jobs
exports.deleteJob = async (req, res) => {
    try {
        const record = await Jobs.findById(req.params.id);
        if (!record) {
            return responseHandler.notFound(res, "job not found");
        }
        if (record.isDeleted) {
            return responseHandler.badRequest(res, "job is already soft deleted");
        }
        record.isDeleted = true;
        record.deletedAt = new Date();
        await record.save();
        const formatter = await jobSingleCollection(record);
        return responseHandler.success(res, "job soft deleted successfully", {
            data: formatter,
        });
    } catch (error) {
        console.log(error);
        return responseHandler.error(res, error.message);
    }
};

// restore the job
exports.restoreJob = async (req, res) => {
    try {
        const record = await Jobs.findById(req.params.id);
        if (!record) {
            return responseHandler.notFound(res, "job not found");
        }
        if (!record.isDeleted) {
            return responseHandler.badRequest(res, "job is already restored");
        }
        record.isDeleted = false;
        record.deletedAt = null;
        await record.save();
        const formatter = await jobSingleCollection(record);
        return responseHandler.success(res, "job restored successfully", {
            data: formatter,
        });
    } catch (error) {
        console.log(error);
        return responseHandler.error(res, error.message);
    }
};

// Permanently Delete Job
exports.permanentDeleteJob = async (req, res) => {
    try {
        const deletedJob = await jobService.deleteJob(req.params.id);
        if (!deletedJob) {
            return responseHandler.notFound(res, "Job not found" );
        }
        return responseHandler.success(res, "Job permanently deleted successfully" );
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error.message);
    }
};




