const mongoose=require('mongoose');
require('dotenv').config();
const connectDB= async()=>{
    try {
        console.log(process.env.PORT)
        let MONGO_URL=process.env.MONGO_URI
        
        let connection=await mongoose.connect(MONGO_URL)
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
}

module.exports=connectDB
