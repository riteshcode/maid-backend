
const CleanerDashboard = require ('../../models/cleaner-dashboard.model')

exports.createCleanerDashboard = async (req, res) => {
    try {
        const { cleanerId } = req.body;

        const existing = await CleanerDashboard.findOne({ cleanerId });
        if (existing) {
            return res.status(400).json({ status: false, message: 'Dashboard already exists for this cleaner.' });
        }

        const dashboard = await CleanerDashboard.create({ cleanerId });
        res.status(201).json({
            status: true,
            message: 'Dashboard created successfully',
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};


exports.getCleanerDashboard = async (req, res) => {
    try {
        const { cleanerId } = req.params;
        const dashboard = await CleanerDashboard.findOne(cleanerId).populate({
            path: 'cleanerId',
            select: 'name rating'
        });
        
        if (!dashboard) {
            return res.status(404).json({ status: false, message: 'Dashboard not found' });
        }

        res.status(200).json({
            status: true,
            message: 'Dashboard fetched successfully',
            data: {
                name: dashboard.cleanerId.name,
                rating: dashboard.cleanerId.rating,
                review: dashboard.review,
                totalEarning: dashboard.totalEarning,
                jobsUndertaken: dashboard.jobsUndertaken,
                totalWithdrawal: dashboard.totalWithdrawal,
                completedJobs: dashboard.completedJobs,
                clientReviews: dashboard.clientReviews,
               
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};
