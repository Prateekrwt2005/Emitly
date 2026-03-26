import mongoose from "mongoose";
import { ENV } from "./env.js";

const connectDB=async()=>{
    try {
        const {MONGO_URI}=ENV;
        if(!MONGO_URI){
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        const conn=await mongoose.connect(ENV.MONGO_URI)
            console.log("mongoose connected",conn.connection.host);
    }
        
     catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;