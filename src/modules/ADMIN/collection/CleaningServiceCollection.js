const cleaningServiceFormatter = (record) => ({
    id: record._id,
    name: record.name,
    description: record.description,
    bestFor: record.bestFor,
    includes: record.includes,
    frequency: record.frequency,
    price: record.price,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
});

// Function to handle single user
const cleaningServiceSingleCollection = (record) => cleaningServiceFormatter(record);

// Function to handle multiple records
const cleaningServiceCollection = (records) => records.map(cleaningServiceFormatter);

module.exports = { cleaningServiceSingleCollection, cleaningServiceCollection };
