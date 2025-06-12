const { getFileUrl } = require("../../../helper/uploadHelper");

const cleaningCategoryFormatter = async (record) => ({
    id: record._id,
    name: record.name,
    description: record.description,
    // parentId: record.parentId,
    categoryImage: record.categoryImage,
    categoryImageURL: await getFileUrl(record.categoryImage, "cleaningCategory"),
    // status: record.status,
    // createdAt: record.createdAt,
    // updatedAt: record.updatedAt,
});

// Function to handle single user
const cleaningCategorySingleCollection = async (record) => await cleaningCategoryFormatter(record);

// Function to handle multiple records
const cleaningCategoryCollection = async (records) => 
    Promise.all(records.map((record) => cleaningCategoryFormatter(record)));

module.exports = { cleaningCategorySingleCollection, cleaningCategoryCollection };
