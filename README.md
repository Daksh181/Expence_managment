# Expense Management System

A complete, professional Expense Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This system provides comprehensive expense tracking, approval workflows, OCR receipt processing, and multi-level approval flows for companies of all sizes.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Manager, Employee)
- **Expense Management**: Create, edit, delete, and track expense submissions
- **Multi-level Approval Workflows**: Configurable approval chains with sequential and conditional approvals
- **OCR Integration**: Automatic receipt data extraction using Tesseract.js
- **Currency Conversion**: Real-time exchange rate conversion using external APIs
- **File Upload**: Secure receipt storage with Cloudinary integration
- **Notifications**: In-app and email notifications for approvals and updates

### User Roles & Permissions
- **Admin**: Full system control, user management, approval rule configuration
- **Manager**: Team oversight, expense approvals, team member management
- **Employee**: Expense submission, personal expense tracking

### Advanced Features
- **Responsive Design**: Modern UI with TailwindCSS and shadcn/ui components
- **Dark/Light Mode**: Theme switching with system preference detection
- **Data Visualization**: Charts and analytics using Recharts
- **Export Functionality**: PDF and Excel export capabilities
- **Search & Filtering**: Advanced search and filter options
- **Audit Trail**: Complete activity logging and tracking
- **Email Integration**: Automated email notifications using Nodemailer

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Cloudinary** for cloud storage
- **Tesseract.js** for OCR processing
- **Nodemailer** for email services
- **Axios** for external API calls

### Frontend
- **React 18** with functional components and hooks
- **Redux Toolkit** for state management
- **React Router** for navigation
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Hook Form** for form management
- **Zod** for validation
- **React Hot Toast** for notifications

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-management-system
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Update the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@expensemanagement.com

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
```

### 4. Set Up External Services

#### MongoDB
- **Local**: Install MongoDB locally or use MongoDB Atlas
- **Atlas**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)

#### Cloudinary (for file storage)
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

#### Email Service (Gmail example)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Use your Gmail credentials in the `.env` file

### 5. Run the Application

#### Development Mode (Recommended)
```bash
# From the root directory
npm run dev
```

This will start both the server (port 5000) and client (port 3000) concurrently.

#### Manual Start
```bash
# Terminal 1 - Start the server
cd server
npm run dev

# Terminal 2 - Start the client
cd client
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
expense-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Layout/     # Layout components
│   │   │   └── UI/         # UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── lib/            # Utility functions
│   │   └── App.js          # Main App component
│   ├── tailwind.config.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword/:token` - Reset password
- `GET /api/auth/logout` - Logout

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats/overview` - Get expense statistics

### Approvals
- `GET /api/approvals/pending` - Get pending approvals
- `GET /api/approvals/history` - Get approval history
- `PUT /api/approvals/:expenseId` - Approve/reject expense
- `PUT /api/approvals/bulk` - Bulk approve/reject
- `GET /api/approvals/stats` - Get approval statistics

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/team` - Get team members
- `GET /api/users/managers` - Get managers

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/stats` - Get notification stats

### File Upload & OCR
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:publicId` - Delete file
- `POST /api/ocr/extract` - Extract text from image
- `GET /api/ocr/languages` - Get supported languages

### Currency
- `GET /api/currency/supported` - Get supported currencies
- `GET /api/currency/rates` - Get exchange rates
- `POST /api/currency/convert` - Convert currency
- `POST /api/currency/format` - Format currency

## 🎨 UI Components

The application uses a modern design system with:

- **TailwindCSS** for utility-first styling
- **shadcn/ui** for accessible, customizable components
- **Framer Motion** for smooth animations
- **Lucide React** for consistent iconography
- **Dark/Light mode** support
- **Responsive design** for all screen sizes

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Role-based Access Control** (RBAC)
- **Input Validation** using express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **File Upload Validation** with type and size restrictions

## 📊 Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/manager/employee),
  companyId: ObjectId,
  managerId: ObjectId,
  department: String,
  position: String,
  phone: String,
  avatar: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Expense Model
```javascript
{
  employeeId: ObjectId,
  companyId: ObjectId,
  title: String,
  description: String,
  category: String,
  amount: Number,
  currency: String,
  convertedAmount: Number,
  baseCurrency: String,
  exchangeRate: Number,
  expenseDate: Date,
  status: String (draft/pending/approved/rejected),
  receipts: Array,
  approvalFlow: Array,
  currentApprover: ObjectId
}
```

### Company Model
```javascript
{
  name: String,
  country: String,
  currency: String,
  timezone: String,
  address: Object,
  contact: Object,
  settings: Object,
  isActive: Boolean
}
```

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

1. **Prepare for deployment**:
   ```bash
   cd server
   npm install --production
   ```

2. **Environment Variables**: Set all environment variables in your hosting platform

3. **Deploy**: Push to your repository and connect to your hosting service

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy**: Connect your repository to Vercel or Netlify

3. **Environment Variables**: Set `REACT_APP_API_URL` to your backend URL

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Update `MONGODB_URI` in your environment variables

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with accounting software
- [ ] Multi-language support
- [ ] Advanced OCR with AI
- [ ] Real-time collaboration features
- [ ] Advanced approval workflows
- [ ] Budget management
- [ ] Expense policy enforcement
- [ ] Advanced search and filtering

## 🙏 Acknowledgments

- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Recharts](https://recharts.org/) for data visualization
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR functionality

---

**Built with ❤️ using the MERN stack**

