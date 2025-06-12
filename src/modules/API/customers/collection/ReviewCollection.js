const { getFileUrl } = require("../../../helper/uploadHelper");

const userFomat = async (user) => ({
  id: user._id,
  name: user.name,
  profileImage: user.profileImage,
  profileImageURL: await getFileUrl(user.profileImage || "", "users"),
});

const reviewFormatter = async (record) => ({
  id: record._id,
  cleanerInfo: record.cleanerInfo,
  userInfo: (await userFomat(record.userInfo)) || null,
  rating: record.rating,
  reviewText: record.reviewText,
});

// Function to handle single user
const singleReviewCollection = async (user) => await reviewFormatter(user);

// Function to handle multiple users
const reviewCollection = async (users) =>
  Promise.all(users.map((user) => reviewFormatter(user)));

module.exports = { singleReviewCollection, reviewCollection };
