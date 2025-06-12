const { getFileUrl } = require("../../../helper/uploadHelper");

const cleaningServiceFormatter = (record) => ({
    id: record._id,
    name: record.name,
    description: record.description,
    bestFor: record.bestFor,
    includes: record.includes,
    frequency: record.frequency,
    price: record.price,
    // createdAt: record.createdAt,
    // updatedAt: record.updatedAt,
});

// 
const cleanersDeailsFormatter = async (cleaner) => ({
  id: cleaner._id,
  name: cleaner.name,
  email: cleaner.email,
  mobile: cleaner.mobile,
  profileImage: cleaner.profileImage,
  rating: cleaner.rating,
  hourlyRate: cleaner.hourlyRate,
  address: {
    street: cleaner.address,
    city: cleaner.city,
    state: cleaner.state,
    country: cleaner.country,
    zipcode: cleaner.zipcode,
    latitude: cleaner.latitude,
    longitude: cleaner.longitude,
  },
  availability: cleaner.availability,
  profileImage: cleaner.profileImage,
  profileImageURL: await getFileUrl(cleaner.profileImage, "cleaners"),
  services: cleaner.services || null,
  cleaningCategory:cleaner.cleaningCategory || null,
  reviews:cleaner.reviews || null,
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
const cleaningServiceSingleCollection = async (record) => await cleanersDeailsFormatter(record);

// Function to handle multiple records
const cleaningServiceCollection = (records) => records.map(cleaningServiceFormatter);

module.exports = { cleaningServiceSingleCollection, cleaningServiceCollection };
