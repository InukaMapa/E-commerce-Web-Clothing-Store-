const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error("\n========================================================");
    console.error("ERROR: MongoDB connection URI is undefined.");
    console.error("Please make sure that either MONGODB_URI or MONGO_URI");
    console.error("is defined in your backend/.env file.");
    console.error("========================================================\n");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Code:", error.code);
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;