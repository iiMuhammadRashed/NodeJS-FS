# {{PROJECT_NAME}}

Express + Mongoose backend with authentication, validation, and file uploads.

## � Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy and edit `.env`:

```bash
cp .env.example .env
```

**Required Variables:**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
CORS_ORIGIN=http://localhost:3000
```

**Optional (for full features):**

```env
# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for password reset, verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

### 3. Start Development

```bash
npm run dev    # Development with auto-reload
npm start      # Production mode
```

Server starts at `http://localhost:5000`

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

#### Get Current User

```bash
GET /auth/me
Authorization: Bearer <access-token>
```

#### Update Profile

```bash
PATCH /auth/me
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### Change Password

```bash
PATCH /auth/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

#### Refresh Token

```bash
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Forgot Password

```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password

```bash
PATCH /auth/reset-password/:token
Content-Type: application/json

{
  "password": "NewSecurePass456"
}
```

#### Logout

```bash
POST /auth/logout
Authorization: Bearer <access-token>
```

---

### Product Endpoints

#### List Products

```bash
GET /products?page=1&limit=10&sort=-createdAt&search=keyword&category=electronics
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field (prefix with `-` for descending)
- `search` - Search in name/description
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

#### Get Single Product

```bash
GET /products/:id
```

#### Create Product (Admin Only)

```bash
POST /products
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "stock": 100,
  "featured": false
}
```

#### Update Product (Admin Only)

```bash
PATCH /products/:id
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 89.99
}
```

#### Delete Product (Admin Only)

```bash
DELETE /products/:id
Authorization: Bearer <admin-access-token>
```

#### Get Featured Products

```bash
GET /products/featured
```

#### Products by Category

```bash
GET /products/category/:category
```

---


## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Configured origin control
- **Rate Limiting**: 
  - General: 100 req/15min
  - Auth: 5 req/15min
  - Upload: 10 req/hour
- **JWT**: Access + refresh token strategy
- **Bcrypt**: Password hashing (12 rounds)
- **Joi**: Input validation
- **XSS Protection**: Sanitized inputs
- **MongoDB Injection**: Prevented

---

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js         # MongoDB connection
│   ├── logger.js           # Winston configuration
│   └── cloudinary.js       # Cloudinary setup
├── middlewares/
│   ├── auth.js             # JWT verification
│   ├── authorize.js        # Role-based access
│   ├── validate.js         # Joi validation
│   ├── errorHandler.js     # Error handling
│   ├── rateLimiter.js      # Rate limiting
│   └── upload.js           # File upload (Multer)
├── models/
│   ├── User.js             # User model
│   └── Product.js          # Product model
├── controllers/
│   ├── authController.js   # Auth logic
│   └── productController.js # Product logic
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   └── productRoutes.js    # Product endpoints
├── utils/
│   ├── AppError.js         # Custom error class
│   ├── catchAsync.js       # Async wrapper
│   ├── slugify.js          # URL slug generator
│   ├── imageProcessor.js   # Sharp + Cloudinary
│   └── sendEmail.js        # Nodemailer
├── app.js                  # Express configuration
└── index.js                # Entry point
```

---

## 🛠️ Available Scripts

```bash
npm start          # Production mode
npm run dev        # Development with auto-reload
npm test           # Run tests (if configured)
```

---

## 📦 Dependencies

### Core

- express 5.1.0
- mongoose 8.19.1

### Security

- helmet 8.1.0
- cors 2.8.5
- express-rate-limit 8.1.0
- bcrypt 6.0.0
- jsonwebtoken 9.0.2

### Validation & Processing

- joi 18.0.1
- multer 2.0.2
- sharp 0.34.4

### Utilities

- winston 3.18.3
- morgan 1.10.1
- nodemailer 7.0.9
- cloudinary 2.7.0
- dotenv 17.2.3
- compression 1.8.1
- slugify 1.6.6

---

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### Register & Login Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123456"}'

# 2. Login (copy accessToken from response)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'

# 3. Get profile
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## � Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure MongoDB Atlas URI
4. Set up Cloudinary account
5. Configure email service

### Production Checklist

- [ ] MongoDB connection string updated
- [ ] JWT secrets changed
- [ ] CORS origin configured
- [ ] Cloudinary credentials set (if using uploads)
- [ ] Email service configured (if using email features)
- [ ] Environment variables secured
- [ ] Logging configured
- [ ] Rate limits reviewed

---

## 🤝 Customization

### Add New Model

1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Register routes in `src/app.js`

### Add Validation Schema

Create Joi schema in controller or separate file:

```javascript
import Joi from 'joi';

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required()
});
```

### Add Middleware

```javascript
// src/middlewares/yourMiddleware.js
export const yourMiddleware = (req, res, next) => {
  // Your logic
  next();
};
```

---

## 📝 License

MIT

---

## � Support

For issues or questions, contact the maintainer or open an issue in the project repository.

---

**Generated by [nodejs-fs](https://www.npmjs.com/package/nodejs-fs)**
