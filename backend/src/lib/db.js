import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conc = await mongoose.connect(process.env.DB_URL);
    console.log("MONGODB CONNECTED to Mongo:", conc.connection.host);
  } catch (err) {
    console.error("Error connection to mongoDB:", err);
    process.exit(1);
  }
};
