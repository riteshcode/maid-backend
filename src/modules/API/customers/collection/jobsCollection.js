
const jobFormatter = async (record) => ({
  _id :record._id,
  userId: record._id,
  cleanerId:record.cleanerId,
  CleaningServiceId:record.CleaningServiceId,
  jobDate:record.jobDate,
  jobTime:record.jobTime,
  address: {
    country: record.country,
    state: record.state,
    city: record.city,
    pinCode: record.pinCode,
    latitude: record.latitude,
    longitude: record.longitude,
  },
  cleaningService:{
    weeklyCleaning :record.weeklyCleaning,
    biWeeklyCleanings:record.BiWeeklyCleanings,
    monthlyCleaning:record.monthlyCleaning,
    oneTimeCleaning:record.oneTimeCleaning,
  },
  areaSize: {
    small: record.small,
    medium: record.medium,
    large: record.large,
  },
  numberOfRoom : {
    bedrooms: record.bedrooms,
    bathrooms:record.bathrooms,
  },
  status:record.status,
  completedAt:record.completedAt,
  rejectedAt:record.rejectedAt,
  deletedAt:record.deletedAt
  
});

// Function to handle single user
const jobSingleCollection = async (record) =>
  await jobFormatter(record);

// Function to handle multiple availabilities
const jobCollection = async (records) =>
Promise.all(records.map((record) => jobFormatter(record)));

module.exports = { jobSingleCollection, jobCollection };
