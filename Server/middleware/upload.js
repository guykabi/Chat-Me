const multer = require('multer') 
const path = require('path')

const storage = multer.diskStorage({})

const upload = multer({})


module.exports = upload 
