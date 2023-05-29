import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folder, next) => {

 try{

    if (folder === 'chat-videos') { 
      if (file?.size / (1024 * 1024) >= 60) {
        
        const data = await cloudinary.v2.uploader.upload_large(file.path, {
          resource_type: "video",
          chunk_size: 10000000,
          format:'webm'
        });

        return { url: data.url, cloudinary_id: data.public_id, video: true };
      }
      
      const data = await cloudinary.v2.uploader.upload(file?.path || file, {
        resource_type: "video",
        folder,
        format:'webm'
      });
      
      return { url: data.url, cloudinary_id: data.public_id, video: true };
    }
    
    const data = await cloudinary.v2.uploader.upload(file?.path || file, {
      folder,
      format:'webp'
    });
    
    return {url:data.url, cloudinary_id:data.public_id}

    }catch(error){ 
       next(error) 
    }

};

export const removeFromCloudinary = async (public_id) => {
  let type = public_id.includes('video')
  await cloudinary.v2.uploader.destroy(public_id, {resource_type:type?"video":"image"}, 
  (error, result) => {
    return "Removed successfully";
  });
};
