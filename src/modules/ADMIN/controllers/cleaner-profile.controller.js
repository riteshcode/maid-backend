const Cleaners = require("../../models/cleaners.model");
const responseHandler = require("../../helper/response");
const { cleanerSingleCollection } = require("../../ADMIN/collection/CleanersCollection");

					
					
const getCleanerProfile = async (req, res) => {					
    try {					
    if (!req.user || !req.user.id) {					
    return responseHandler.Unauthorized(res, "Unauthorized: user not found in request");					
    }					
                        
    const user = await Cleaners.findById(req.user.id);					
    if (!user) {					
    return responseHandler.notFound(res, "User not found");					
    }					
                        
    const formatter = await cleanerSingleCollection(user);					
    return responseHandler.success(res, "Successfully viewed profile", { user: formatter });					
    } catch (error) {					
    console.error("Error fetching profile:", error.message);					
    return responseHandler.error(res, "Internal Server Error");					
    }					
    };					
       



//  CREATE user
async function createUser(req, res) {
    try {
        const { name, email, mobile, profileImage } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const user = await User.create({ name, email, mobile, profileImage });
        return res.status(201).json({ success: true, message: "User created", data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

//  UPDATE user
async function updateUser(req, res) {
    try {
        const { name, email, mobile, profileImage } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, mobile, email, profileImage },
            { new: true, runValidators: true }
        ).select("name email mobile profileImage");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User updated", data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

//  DELETE user (soft delete)
async function deleteUser(req, res) {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User soft-deleted" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
//  GET ALL users (excluding soft-deleted)
async function getAllUsers(req, res) {
    try {
        const users = await User.find().select("name email mobile profileImage status");

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching users",
            error: err.message,
        });
    }
};



module.exports = {
    createUser,
    getCleanerProfile,
    updateUser,
    deleteUser,
    getAllUsers
};


