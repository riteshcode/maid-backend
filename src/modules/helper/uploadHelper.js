const fs = require("fs").promises; // Using promises-based fs module
const path = require("path");
const logger = require("../../utils/logger");

exports.fileUploadHandler = async (tempImageName, folderName) => {
  const tempPath = path.join(
    process.cwd(),
    `public/tempUploads/${tempImageName}`
  );
  const destinationDir = path.join(process.cwd(), `public/uploads/${folderName}`);
  try {
    await fs.access(tempPath);
  } catch (error) {
    logger.error(
      `FileUploadHandler Helper Uplaoded Image for folderName : ${folderName} - File not found at path ${tempPath} : ${error.message}`
    );
    return tempImageName;
  }
  await fs.mkdir(destinationDir, { recursive: true });
  const finalFilePath = path.join(destinationDir, tempImageName);
  await fs.rename(tempPath, finalFilePath);
  return tempImageName;
};

exports.getFileUrl = async (imageName, folderName) => {

  const baseUrl = process.env.APP_ASSETS_URL; // e.g., http://localhost:3000/uploads
  if(imageName ==='' || imageName === null || imageName === undefined){
    return `${baseUrl}/default/not-found.png`;
  }

  const filePath = path.join(process.cwd(), `public/uploads/${folderName}/${imageName}`); // Adjust path if needed

  try {
    await fs.access(filePath); // checks if file exists
    return `${baseUrl}/uploads/${folderName}/${imageName}`;
  } catch (err) {
    return `${baseUrl}/default/not-found.png`; // fallback image path
  }
};
