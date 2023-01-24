const errorHnadler = (error,req,resp,next)=>{
    console.log(error.message)
    return resp.status(500).json(error.message)
 }
 
 module.exports = errorHnadler