const bannersFormatter = (record) => ({
    id: record._id,
    title: record.title,
    discount: record.discount,
    imageURL: record.imageURL,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
});

// Function to handle single user
const bannersSingleCollection = (record) => bannersFormatter(record);

// Function to handle multiple records
const bannersCollection = (records) => records.map(bannersFormatter);

module.exports = { bannersSingleCollection, bannersCollection };
