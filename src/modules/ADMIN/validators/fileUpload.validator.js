const { body } = require("express-validator");

exports.checkFileExist = [
  body("tempImage").custom((_, { req }) => {
    if (!req.files || !req.files.tempImage) {
      throw new Error("Please upload a file.");
    }

    const pImage = req.files.tempImage;

    // Allowed file types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedMimeTypes.includes(pImage.mimetype)) {
      throw new Error("Invalid file type. Allowed: images, docs, excel files.");
    }

    // File size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (pImage.size > maxSize) {
      throw new Error("File size exceeds 10MB limit.");
    }

    return true;
  }),
];
