/**
 * Utility script to create or promote a user to admin role.
 * Usage: node scripts/createAdmin.js [email] [name] [password] [phone]
 * Defaults: admin@bank.com / Bank Administrator / admin123 / 9999999999
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fraud_shield';
  await mongoose.connect(uri);
  console.log('MongoDB connected for admin script.');

  const email = process.argv[2] || 'admin@bank.com';
  const name = process.argv[3] || 'Bank Administrator';
  const password = process.argv[4] || 'admin123';
  const phone = process.argv[5] || '9999999999';

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log(`User "${email}" exists. Promoting to admin...`);
      user.role = 'admin';
      await user.save();
      console.log('Done — user is now an admin.');
    } else {
      console.log('Creating new admin user...');
      user = new User({ name, email, password, phone, role: 'admin' });
      await user.save();
      console.log('Admin created successfully!');
      console.log(`  Email:    ${email}`);
      console.log(`  Password: ${password}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

run();
