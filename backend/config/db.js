const mongoose = require("mongoose");

/**
 * Establishes a connection to MongoDB using the URI provided in
 * environment variables. Exits the process on failure since the
 * API cannot function without a database connection.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri, {
      // Mongoose 8+ no longer needs useNewUrlParser / useUnifiedTopology,
      // but they are harmless if a downgrade is ever required.
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect is handled by the driver.");
    });
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
