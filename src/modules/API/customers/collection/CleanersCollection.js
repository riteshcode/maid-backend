const { getFileUrl } = require("../../../helper/uploadHelper");

const cleanersFormatter = async (cleaner) => ({
  id: cleaner._id,
  name: cleaner.name,
  email: cleaner.email,
  mobile: cleaner.mobile,
  profileImage: cleaner.profileImage,
  rating: cleaner.rating,
  hourlyRate: cleaner.hourlyRate,
  services: cleaner.services || null,
  cleaningCategory:cleaner.cleaningCategory || null,
  availability: cleaner.availability,
  profileImage: cleaner.profileImage,
  profileImageURL: await getFileUrl(cleaner.profileImage, "cleaners"),
});

const cleanersDetailFormatter = async (cleaner) => ({
  id: cleaner._id,
  name: cleaner.name,
  email: cleaner.email,
  mobile: cleaner.mobile,
  profileImage: cleaner.profileImage,
  rating: cleaner.rating,
  hourlyRate: cleaner.hourlyRate,
  address: cleaner.address,
  city: cleaner.city,
  state: cleaner.state,
  country: cleaner.country,
  zipcode: cleaner.zipcode,
  latitude: cleaner.latitude,
  longitude: cleaner.longitude,
  availability: cleaner.availability,
  profileImage: cleaner.profileImage,
  profileImageURL: await getFileUrl(cleaner.profileImage, "cleaners"),
  services: cleaner.services,
  backgroundChecked: cleaner.backgroundChecked,
  isSocialMediaSignUp: cleaner.isSocialMediaSignUp,
  isSocialMediaSignUpPlatform: cleaner.isSocialMediaSignUpPlatform,
  isBlueBadgeShow: cleaner.isBlueBadgeShow,
  education: cleaner.education,
  status: cleaner.status,
  createdAt: cleaner.createdAt,
  updatedAt: cleaner.updatedAt,
});

// Function to handle single user
const cleanerSingleCollection = async (record) =>
  await cleanersDetailFormatter(record);

// Function to handle multiple records
const CleanerCollection = async (records) =>
  Promise.all(records.map((record) => cleanersFormatter(record)));

module.exports = { cleanerSingleCollection, CleanerCollection };
