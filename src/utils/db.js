import mongoose from "mongoose";

let connected = false;

export async function connectToDb(uri) {
  try {
    if (connected) return mongoose.connection;
    const MONGODB_URI =
      uri || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/easily";
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI);
    connected = true;
    return mongoose.connection;
  } catch (err) {
    // In dev/test allow the app to run without a DB; callers can decide how to proceed
    console.warn("Mongo connection failed:", err.message);
    throw err;
  }
}
