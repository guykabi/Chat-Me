import multer from 'multer'

const storage = multer.diskStorage({})

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {

    const acceptedTypes = file.mimetype.split('/');
    if (acceptedTypes[0] === 'image' || acceptedTypes[0] === 'video') {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error('Only image or video allowed!'));
        }
      }
})


