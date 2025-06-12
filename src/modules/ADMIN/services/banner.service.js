const banners = require("../../models/banner.model");
const {
    bannersSingleCollection,
    bannersCollection,
} = require("../collection/bannerCollection");
var path = require("path");
const fs = require("fs");
const { fileUploadHandler } = require("../../helper/uploadHelper");
const responseHandler = require("../../helper/response");
const bannerService = {}


///////////////////////////////////CREATE Service /////////////////////////////////////////////////////////
bannerService.add = async (req) => {
    await fileUploadHandler(req.body.imageURL, 'banners');
    const record = new banners(req.body);
    await record.save();
    return record;
}
////////////////////////////////// UPDATE SERVICE //////////////////////////////////////////////////////////
bannerService.update = async (req) => {
    const { title, discount, imageURL } = req.body;
    const existingRecord = await banners.findById(req.params.id);
    if (!existingRecord) return {error: "This Banner Does Not Exist",status:404};
    if (imageURL && existingRecord.imageURL !== req.body.imageURL) {
        const oldImagePath = path.join(process.cwd(), `public/banners/${existingRecord.imageURL}`);
        if (existingRecord.imageURL && fs.existsSync(oldImagePath)) await fs.promises.unlink(oldImagePath);

        existingRecord.imageURL = await fileUploadHandler(imageURL, 'banners');
    }

    Object.assign(existingRecord, { title, discount });
    await existingRecord.save();
    return {data:existingRecord};
}
///////////////////////////////////Get All ID ///////////////////////////////////////////////////////////////////
bannerService.get = async (req) => {
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1; // Default to page 1
    limit = parseInt(limit) || 50; // Default limit 10
    const skip = (page - 1) * limit;
    let query = {}; // Construct search filters
    if (search) {
        query.$or = [
            { title: { $regex: new RegExp(search, "i") } }, // Case-insensitive search by name
        ];
    }
    const totalRecords = await banners.countDocuments(query);
    const records = await banners
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(); // Sort by latest records
    return {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        records: bannersCollection(records),
    }
}



module.exports = bannerService