import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Remove quotes
    api_key: process.env.CLOUDINARY_API_KEY,       // Remove quotes
    api_secret: process.env.CLOUDINARY_API_SECRET  // Remove quotes
  });
  
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath);
    fs.unlinkSync(filePath); // Move this inside try block
    return uploadResult.secure_url;
  } catch(error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error("Cloudinary upload failed");
  }
}

export default uploadOnCloudinary;