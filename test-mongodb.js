const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('ConnectionTest', testSchema);
    
    const testDoc = new TestModel({
      message: 'MongoDB connection test successful!'
    });
    
    await testDoc.save();
    console.log('✅ Test document saved successfully!');
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication failed. Check your username and password in the connection string.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network error. Check your connection string and internet connection.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection refused. Make sure MongoDB is running.');
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your MONGODB_URI in server/.env');
    console.log('2. For Atlas: Verify your IP is whitelisted');
    console.log('3. For Atlas: Check your username and password');
    console.log('4. For local: Make sure MongoDB service is running');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection();

