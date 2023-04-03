export const errorHandler = (err,req,resp,next)=>{
    const status = err.status || 500
    const message = err.message || 'Something went wrong'
    
    if(message === 'Failed to authenticate refresh token'){
        return resp.status(401).json({
            success:false,
            status:401,
            message
        })
    }
        return resp.status(status).json({
        success:false,
        status,
        message
    })
 }
 
