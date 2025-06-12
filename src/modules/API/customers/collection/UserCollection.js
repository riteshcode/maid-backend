const { getFileUrl } = require("../../../helper/uploadHelper");

const userFormatter = async (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    status: user.status,
    plan: user.plan,
    planExpiredDate: user.planExpiredDate,
    isPlanActive: user.isPlanActive,
    autoRenew: user.autoRenew,
    profileImage:user.profileImage,
    profileImageURL: await getFileUrl(user.profileImage, 'users'),
    isSocialMediaSignUp: user.isSocialMediaSignUp,
    isSocialMediaSignUpPlatform: user.isSocialMediaSignUpPlatform,
    isDeleted: user.isDeleted,
    deletedAt: user.deletedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// Function to handle single user
const userSingleCollection = async (user) => await userFormatter(user);

// Function to handle multiple users
const userCollection = async (users) =>
  Promise.all(users.map((user) => userFormatter(user)));

module.exports = { userSingleCollection, userCollection };