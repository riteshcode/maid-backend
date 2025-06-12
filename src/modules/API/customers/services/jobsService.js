


// services/jobService.js

const Job = require('../../../models/jobs.model');

// Create Job
const createJob = async (jobData) => {
    return await Job.create(jobData);
};

// Get All Jobs
const getAllJobs = async () => {
    return await Job.find().populate('userId CleanerId CleaningServiceId');
};

// Get Job By ID
const getJobById = async (id) => {
    return await Job.findById(id).populate('userId CleanerId CleaningServiceId');
};

// Update Job
const updateJob = async (id, updateData) => {
    return await Job.findByIdAndUpdate(id, updateData, { new: true });
};

// Delete Job
const deleteJob = async (id) => {
    return await Job.findByIdAndDelete(id);
};

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
};
