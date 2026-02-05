const mongoose = require("mongoose");

async function dbConnect() {
  try {
    const conn = await mongoose.connect("mongodb+srv://salimkhan668580s_db_user:5I4GH6SSK1FSERD3@docker-eco.6ktkml8.mongodb.net/todo?retryWrites=true&w=majority&appName=docker-eco");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed ❌", error.message);
    process.exit(1); // app band kar do
  }
}

module.exports = dbConnect;
