import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(`Error connecting to MongoDB : ${err}`);
  }
};

export default connectDB;

