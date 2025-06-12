const { getFileUrl } = require("../../helper/uploadHelper");

const subscriptionFormatter = async (record) => ({
  id: record._id,
  name: record.name,
  description: record.description,
  benefits: record.benefits,
  discountPercentage: record.discountPercentage,
  priorityLevel: record.priorityLevel,
  freeAddOnPerMonth: record.freeAddOnPerMonth,
  freeAddOnOptions: record.freeAddOnOptions,
  hasExclusiveAccess: record.hasExclusiveAccess,
  appFeatureAccess: record.appFeatureAccess,
  productDiscountAccess: record.productDiscountAccess,
  planTenure: record.planTenure,
  price: record.price,
  planImage: record.planImage,
  planImageURL: await getFileUrl(record.planImage, "subscriptions"),
  status: record.status,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

// Function to handle single user
const subscriptionSingleCollection = async (record) => subscriptionFormatter(record);

// Function to handle multiple users
const subscriptionCollection = async (records) =>
  Promise.all(records.map((record) => subscriptionFormatter(record)));

module.exports = { subscriptionSingleCollection, subscriptionCollection };
