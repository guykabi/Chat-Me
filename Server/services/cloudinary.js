import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folder, next) => {
  try {
    if (file.mimetype.includes("video")) {
      if (file.size / (1024 * 1024) >= 60) {
        //Heavy video - over 60MB
        const data = await cloudinary.v2.uploader.upload_large(file.path, {
          resource_type: "video",
          chunk_size: 10000000,
        });
        return { url: data.url, cloudinary_id: data.public_id, video: true };
      }
      const data = await cloudinary.v2.uploader.upload(file.path, {
        resource_type: "video",
        folder,
      });
      return { url: data.url, cloudinary_id: data.public_id, video: true };
    }
    const data = await cloudinary.v2.uploader.upload(file.path, { folder });
    return { url: data.url, cloudinary_id: data.public_id };
  } catch (err) {
    next(err);
  }
};

export const removeFromCloudinary = async (public_id) => {
  await cloudinary.v2.uploader.destroy(public_id, (error, result) => {
    return "Removed successfully";
  });
};
