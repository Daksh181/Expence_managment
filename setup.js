#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Expense Management System...\n');

// Check if .env file exists in server directory
const envPath = path.join(__dirname, 'server', '.env');
const envExamplePath = path.join(__dirname, 'server', 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from env.example');
    console.log('⚠️  Please update the .env file with your actual configuration values');
  } else {
    console.log('❌ env.example file not found');
  }
} else {
  console.log('✅ .env file already exists');
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'client', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created client/public directory');
}

// Create index.html in public directory
const indexPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Expense Management System - Professional expense tracking and approval workflows"
    />
    <title>Expense Management System</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  
  fs.writeFileSync(indexPath, indexHtml);
  console.log('✅ Created index.html');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update server/.env with your configuration');
console.log('2. Start MongoDB (local or use MongoDB Atlas)');
console.log('3. Run: npm run dev');
console.log('\n🌐 Access the application at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5000');
console.log('\n📚 See README.md for detailed setup instructions');

