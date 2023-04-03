import cloudinary from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
}) 


export const uploadToCloudinary = async(path,folder,next) =>{
  try{
    
    const data = await cloudinary.v2.uploader.upload(path,{folder})    
    return {url:data.url ,cloudinary_id:data.public_id}
  }catch(err){
    next(err)
  }
       
}  


export const removeFromCloudinary =async (public_id) =>{
    await cloudinary.v2.uploader.destroy(public_id, (error,result)=>{
        return 'Removed successfully'
    })
}


