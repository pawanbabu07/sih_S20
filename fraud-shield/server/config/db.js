const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    const isAtlas = conn.connection.host.includes('mongodb.net');
    console.log(`✓ MongoDB Connected: ${isAtlas ? 'MongoDB Atlas (Cloud Cluster)' : conn.connection.host} [DB: ${conn.connection.name}]`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};

module.exports = connectDB;
