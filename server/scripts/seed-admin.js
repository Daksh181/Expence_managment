require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-management';
  await mongoose.connect(mongoUri);

  console.log('Connected to MongoDB:', mongoUri);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Password123!';
  const companyName = process.env.SEED_COMPANY_NAME || 'Local Company';
  const currency = process.env.SEED_COMPANY_CURRENCY || 'USD';

  // Create or find company
  let company = await Company.findOne({ name: companyName });
  if (!company) {
    company = await Company.create({ name: companyName, currency, country: 'Local' });
    console.log('Created company:', company.name, company._id);
  } else {
    console.log('Found existing company:', company.name, company._id);
  }

  // Create or update admin user
  let user = await User.findOne({ email: adminEmail });
  if (!user) {
    user = await User.create({
      name: 'Seed Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      companyId: company._id,
      emailVerified: true,
      isActive: true
    });
    console.log('Created admin user:', user.email);
  } else {
    // ensure it's an admin and active
    user.role = 'admin';
    user.companyId = company._id;
    user.emailVerified = true;
    user.isActive = true;
    await user.save();
    console.log('Updated existing user to admin:', user.email);
  }

  console.log(`Admin credentials -> email: ${adminEmail}  password: ${adminPassword}`);

  await mongoose.disconnect();
  console.log('Disconnected, done.');
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
