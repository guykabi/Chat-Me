const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
}) 


const uploadToCloudinary = async(path,folder,next) =>{
  try{
    
    const data = await cloudinary.uploader.upload(path,{folder})    
    return {url:data.url ,cloudinary_id:data.public_id}
  }catch(err){
    next(err)
  }
       
}  


const removeFromCloudinary =async (public_id) =>{
    await cloudinary.uploader.destroy(public_id, (error,result)=>{
        return 'Removed successfully'
    })
}


module.exports = {uploadToCloudinary,removeFromCloudinary}
