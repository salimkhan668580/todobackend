const mongoose = require("mongoose");

async function dbConnect() {
  try {
    const conn = await mongoose.connect("mongodb://host.docker.internal:27017/todo");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed ❌", error.message);
    process.exit(1); // app band kar do
  }
}

module.exports = dbConnect;
