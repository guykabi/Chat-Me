import mongoose from 'mongoose'

mongoose.set('strictQuery', true);
mongoose.connect(`${process.env.MONGO_ATLAS_URL}`)