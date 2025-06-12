const fs = require("fs");
const path = require("path");
const { mkdir } = require("node:fs/promises");
const { validationResult } = require("express-validator");

exports.upload_image = async (request, res) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return res.status(403).json({
      status: false,
      errors: errors.array(),
      message: "Validation error",
      data: null,
    });
  }

  try {
    const pImage = request.files.tempImage;
    const uploadDir = path.join(__dirname, "../../../../public/tempUploads");
    await mkdir(uploadDir, { recursive: true });
    const now_time = Date.now();
    const tempImageName = now_time + "-" + pImage.name;
    const imagePath = uploadDir + "/" + tempImageName;
    await pImage.mv(imagePath);
    return res.status(201).json({
      message:"Uploaded on temp folder",
      data: {
        name: tempImageName,
        url: process.env.APP_ASSETS_URL + '/tempUploads/' + tempImageName,
        size: pImage.size,
        mimetype: pImage.mimetype,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
