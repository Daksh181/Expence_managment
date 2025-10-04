# 🚀 Quick Start Guide

## ✅ What's Already Done

Your Expense Management System is now set up with:
- ✅ All dependencies installed
- ✅ Project structure created
- ✅ Environment file created
- ✅ Basic configuration ready

## 🎯 Next Steps (5 minutes to running app)

### 1. Configure Environment Variables

Edit `server/.env` file with your settings:

```env
# Basic Configuration
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-management
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# For now, you can use these placeholder values:
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@expensemanagement.com

EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
```

### 2. Start MongoDB

**Option A: Local MongoDB**
```bash
# If you have MongoDB installed locally
mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGODB_URI` in `.env`

### 3. Run the Application

```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000).

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎉 You're Ready!

The application will start with:
- ✅ Authentication system
- ✅ Role-based access control
- ✅ Modern UI with dark/light mode
- ✅ Responsive design
- ✅ All core features ready for implementation

## 🔧 Optional: Set Up External Services

### Cloudinary (for file uploads)
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your credentials
3. Update the `.env` file

### Email Service (for notifications)
1. Use Gmail with app password
2. Or use any SMTP service
3. Update the `.env` file

### Exchange Rate API
1. Sign up at [ExchangeRate-API](https://exchangerate-api.com)
2. Get your API key
3. Update the `.env` file

## 🐛 Troubleshooting

### Common Issues:

**Port already in use:**
```bash
# Kill process on port 3000 or 5000
npx kill-port 3000
npx kill-port 5000
```

**MongoDB connection issues:**
- Make sure MongoDB is running
- Check your connection string
- For Atlas, whitelist your IP address

**Dependencies issues:**
```bash
# Clear cache and reinstall
npm cache clean --force
cd client && npm install
cd ../server && npm install
```

## 📚 What's Next?

1. **Register a new company** - Create your first admin account
2. **Add team members** - Invite employees and managers
3. **Configure approval rules** - Set up your approval workflows
4. **Start submitting expenses** - Test the full workflow

## 🆘 Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Review the API endpoints in the README
- Check the console for any error messages

---

**Happy coding! 🎉**

