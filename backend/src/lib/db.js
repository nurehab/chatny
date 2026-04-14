import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const { DB_URL } = ENV;
    if (!DB_URL) throw new Error("DB_URL is not set");

    const conc = await mongoose.connect(DB_URL);
    console.log("MONGODB CONNECTED to Mongo:", conc.connection.host);
  } catch (err) {
    console.error("Error connection to mongoDB:", err);
    process.exit(1);
  }
};
