const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { appLogger } = require("./logger");
const { v4: uuidv4 } = require("uuid");
const s3Client = require("../config/s3");
const { ALLOWED_IMAGE_FORMATS, MAX_IMAGE_SIZE } = require("../constants/constants");

function generateUniqueSessionId(){
    // Generate a more secure session ID using crypto
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

async function uploadToS3(file, userId) {
    try {
        const key = `${uuidv4()}-${file.originalname}`;
        appLogger.info("Starting file upload", { userId, filename: file.originalname });

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        await s3Client.send(command);
        appLogger.info("File uploaded to S3 successfully", { userId, key });

        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return fileUrl;
    }
    catch (err) {
        appLogger.error("File upload to S3 failed", { error: err.message, userId, filename: file.originalname });
        throw err;
    }
}


async function deleteFromS3(fileUrl, userId){
    try{
        appLogger.info("Starting file deletion from S3", { fileUrl, userId });
        const oldKey = fileUrl.split("/").pop();

          const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: oldKey,
          });

          await s3Client.send(deleteCommand);
          appLogger.info("Old profile picture removed from S3", { userId, oldKey });
        return true;
    }
    catch(err){
        appLogger.error("File deletion from S3 failed", { error: err.message, fileUrl });
        throw err;
    }
}

function validateImageFile(file) {
  if (!file) return { valid: false, message: "No file provided" };

  if (!ALLOWED_IMAGE_FORMATS.includes(file.mimetype)) {
    return { valid: false, message: "Invalid file format. Only JPG, JPEG, PNG allowed" };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, message: "File size exceeds 2MB limit" };
  }

  return { valid: true };
}

module.exports = { generateUniqueSessionId, uploadToS3, deleteFromS3, validateImageFile };