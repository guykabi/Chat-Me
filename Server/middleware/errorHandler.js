const errorHnadler = (err,req,resp,next)=>{
    const status = err.status || 500
    const message = err.message || 'Something went wrong'
    return resp.status(status).json({
        success:false,
        status,
        message
    })
 }
 
 module.exports = errorHnadler