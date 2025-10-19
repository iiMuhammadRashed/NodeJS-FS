<div align="center">
  <h1>🚀 nodejs-fs</h1>
  <p><strong>Scaffold production-ready Express + MongoDB backends in seconds</strong></p>
  
  [![npm version](https://img.shields.io/npm/v/nodejs-fs.svg?style=flat-square)](https://www.npmjs.com/package/nodejs-fs)
  [![npm downloads](https://img.shields.io/npm/dm/nodejs-fs.svg?style=flat-square)](https://www.npmjs.com/package/nodejs-fs)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/node/v/nodejs-fs.svg?style=flat-square)](https://nodejs.org)
  
  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-features">Features</a> •
    <a href="#-whats-included">What's Included</a> •
    <a href="#-usage">Usage</a> •
    <a href="#-api-documentation">API Docs</a>
  </p>
</div>

---

## 🎯 Why nodejs-fs?

Stop wasting hours setting up the same backend infrastructure. **nodejs-fs** generates a complete, production-ready Express.js + MongoDB backend with authentication, security, and best practices baked in.

**Perfect for:**
- 🏃‍♂️ Hackathons and MVPs
- 📚 Learning full-stack development
- 🎓 Teaching backend architecture
- 🚀 Rapid prototyping
- 💼 Freelance projects

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### 🔐 Security First
- JWT authentication
- Bcrypt password hashing
- Rate limiting & brute force protection
- Helmet.js security headers
- CORS configuration
- Cookie parser

</td>
<td width="33%" valign="top">

### ⚡ Production Ready
- Express 5.x (latest)
- Environment-based config
- Winston logging
- Global error handling
- Joi validation
- MongoDB connection pooling
- Compression middleware

</td>
<td width="33%" valign="top">

### 🛠️ Developer Experience
- Clean MVC architecture
- RESTful API design
- Node.js watch mode (no nodemon)
- Email templates
- Image upload & processing
- Comprehensive documentation

</td>
</tr>
</table>

## 🚀 Quick Start

Get your backend up and running in 60 seconds:

```bash
# Create your project with npx (no installation needed)
npx create-nodejs-fs my-awesome-api

# Navigate to your project
cd my-awesome-api

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start developing
npm run dev
```

**That's it!** You now have a fully-functional backend with auth, CRUD operations, and more. 🎉

---

## 📦 Installation & Usage

### Option 1: Use with npx (Recommended)

No installation required - just run:

```bash
npx create-nodejs-fs my-project-name
```

### Option 2: Install Globally

```bash
npm install -g nodejs-fs
create-nodejs-fs my-project-name
```

### What Happens Next

The CLI will automatically:
1. Create the project structure
2. Copy all template files
3. Install dependencies (npm install)
4. Set up your backend with all configurations

### Available Options

```bash
create-nodejs-fs <project-name> [options]

Options:
  --no-install    Skip npm install
  --git           Initialize git repository
  --verbose       Show detailed logs
  -v, --version   Output version number
  -h, --help      Display help
```

## 📁 What's Included

### Complete Project Structure

```
your-project/
├── 📂 src/
│   ├── 📂 config/           # Configuration files
│   │   ├── cloudinary.js    # Image hosting setup
│   │   ├── db.js            # MongoDB connection
│   │   └── logger.js        # Winston logger config
│   │
│   ├── 📂 controllers/      # Business logic
│   │   ├── authController.js      # Auth operations
│   │   └── productController.js   # CRUD operations
│   │
│   ├── 📂 middlewares/      # Custom middleware
│   │   ├── auth.js          # JWT verification
│   │   ├── errorHandler.js  # Global error handler
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── validate.js      # Input validation
│   │
│   ├── 📂 models/           # Database schemas
│   │   ├── User.js          # User model + methods
│   │   └── Product.js       # Product model
│   │
│   ├── 📂 routes/           # API routes
│   │   ├── authRoutes.js    # /api/auth/*
│   │   ├── productRoutes.js # /api/products/*
│   │   └── index.js         # Route aggregator
│   │
│   ├── 📂 utils/            # Helper functions
│   │   ├── imageProcessor.js  # Image upload/resize
│   │   ├── mailer.js          # Email sending
│   │   └── slugifyUtil.js     # URL-friendly slugs
│   │
│   ├── app.js              # Express app configuration
│   └── index.js            # Server entry point
│
├── .env.example            # Environment template
├── package.json
└── README.md              # Complete documentation
```

### 🔋 Tech Stack & Dependencies

**Core Framework:**
- **Express.js** `^5.1.0` - Modern, fast web framework (Express 5)
- **Mongoose** `^8.x` - MongoDB object modeling

**Security:**
- **bcrypt** - Password hashing with salt
- **jsonwebtoken** - JWT token generation & verification
- **helmet** - Security HTTP headers
- **express-rate-limit** - Brute force protection
- **cors** - Cross-origin resource sharing

**Utilities:**
- **nodemailer** - Email sending (password reset, notifications)
- **cloudinary** - Cloud image hosting & transformation
- **sharp** - High-performance image processing
- **multer** - Multipart/form-data file upload
- **joi** - Schema validation & sanitization
- **winston** - Comprehensive logging
- **slugify** - URL-friendly string conversion
- **compression** - Gzip compression middleware
- **cookie-parser** - Parse cookies
- **dotenv** - Environment variable management

**Development:**
- **Node.js** `>=18.0.0` - Built-in watch mode with `--watch` flag
- **morgan** - HTTP request logger

---

## ⚙️ Configuration Guide

### Essential Environment Variables

```env
# Server Configuration
PORT=5000                                    # Server port
NODE_ENV=development                         # development | production

# Database
MONGODB_URI=mongodb://localhost:27017/mydb  # MongoDB connection string

# JWT Authentication
JWT_SECRET=your-256-bit-secret-key          # Strong random string
JWT_EXPIRE=7d                               # Token expiration (7d, 24h, etc.)
JWT_COOKIE_EXPIRE=7                         # Cookie expiration in days
```

### Optional Features

```env
# Email Service (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Your App Name

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS and email links)
CLIENT_URL=http://localhost:3000
```

### Quick Setup Tips

**MongoDB Options:**
- 🖥️ **Local:** Install MongoDB Community Server
- ☁️ **Cloud:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

**Email Service:**
- Use Gmail with [App Password](https://support.google.com/accounts/answer/185833)
- Or try [SendGrid](https://sendgrid.com/), [Mailgun](https://www.mailgun.com/), [AWS SES](https://aws.amazon.com/ses/)

**Image Hosting:**
- Sign up at [Cloudinary](https://cloudinary.com/) (free tier: 25GB storage, 25GB bandwidth)

---

## 🎯 Use Cases

Perfect for building:

- 🛍️ **E-commerce APIs** - Product management, user auth, order processing
- 📱 **Mobile App Backends** - REST API for iOS/Android apps
- 💬 **Social Platforms** - User profiles, posts, comments, likes
- 📰 **Blog/CMS Systems** - Content management with authentication
- 🎓 **Learning Management** - Course platforms, student portals
- 🏢 **Business Applications** - CRM, inventory management, booking systems
- 🎮 **Gaming Backends** - Player data, leaderboards, achievements

---

## 🛡️ Security Best Practices

Our template implements enterprise-grade security:

| Security Layer | Implementation |
|---------------|----------------|
| 🔐 **Authentication** | JWT tokens with secure secret key |
| 🔒 **Password Storage** | Bcrypt hashing (10 salt rounds) |
| 🛡️ **HTTP Headers** | Helmet.js (XSS, clickjacking, etc.) |
| 🚦 **Rate Limiting** | Max 100 requests per 15 min per IP |
| ✅ **Validation** | Joi schema validation on all inputs |
| 🌐 **CORS** | Configurable allowed origins |
| 🍪 **Cookies** | HttpOnly, Secure, SameSite flags |
| 📝 **Logging** | Winston for security audits |
| 🗜️ **Compression** | Gzip compression for responses |

---

## 📖 Available Scripts

```bash
npm run dev      # Start with Node.js watch mode (auto-reload)
npm start        # Start production server
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🐛 **Report bugs** - [Open an issue](https://github.com/iiMuhammadRashed/nodejs-fs/issues)
2. 💡 **Suggest features** - Share your ideas
3. 🔧 **Submit PRs** - Fork, code, and create pull requests
4. ⭐ **Star the repo** - Show your support

---

## 📄 License

MIT © MERN Stack Hero

Free to use for personal and commercial projects.

---

## 💬 Support & Community

Need help? We've got you covered:

- 📚 **Documentation:** [GitHub Wiki](https://github.com/iiMuhammadRashed/nodejs-fs)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/iiMuhammadRashed/nodejs-fs/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/iiMuhammadRashed/nodejs-fs/discussions)
- ⭐ **Star us on GitHub** to stay updated

---

## 🗺️ Roadmap

Coming soon:

- [ ] TypeScript template option
- [ ] GraphQL API template
- [ ] WebSocket support
- [ ] Redis caching integration
- [ ] Stripe payment integration
- [ ] Social OAuth (Google, GitHub, Facebook)
- [ ] Swagger/OpenAPI documentation
- [ ] Docker configuration
- [ ] CI/CD templates (GitHub Actions, GitLab CI)
- [ ] Testing setup (Jest, Supertest)

---

<div align="center">

### ⭐ If nodejs-fs helped you, please star the repo! ⭐

**Made with ❤️ by [MERN Stack Hero](https://github.com/iiMuhammadRashed)**

[Report Bug](https://github.com/iiMuhammadRashed/nodejs-fs/issues) · [Request Feature](https://github.com/iiMuhammadRashed/nodejs-fs/issues) · [Contribute](https://github.com/iiMuhammadRashed/nodejs-fs/pulls)

</div>

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/forgot-password` | Request password reset | ❌ |
| POST | `/api/auth/reset-password/:token` | Reset password with token | ❌ |
| GET | `/api/auth/me` | Get current user profile | ✅ |

### 📦 Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products (paginated) | ❌ |
| GET | `/api/products/:id` | Get single product | ❌ |
| POST | `/api/products` | Create new product | ✅ |
| PUT | `/api/products/:id` | Update product | ✅ |
| DELETE | `/api/products/:id` | Delete product | ✅ |

<details>
<summary><strong>📖 Click to see API examples</strong></summary>

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Create a product (with auth):**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Awesome Product",
    "description": "This is an awesome product",
    "price": 99.99,
    "category": "Electronics"
  }'
```

</details>

## Configuration

After generating your project, create a `.env` file based on `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/your-database

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Your App Name

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client URL
CLIENT_URL=http://localhost:3000
```

---

## 🎓 Getting Started Guide

### Step 1: Create Your Project

```bash
npx create-nodejs-fs my-awesome-api
# Or if installed globally:
create-nodejs-fs my-awesome-api
```

The CLI accepts a project name as an argument (no interactive prompts).

**Available options:**
- `--no-install` - Skip dependency installation
- `--git` - Initialize git repository
- `--verbose` - Show detailed logs

### Step 2: Navigate to Your Project

```bash
cd my-awesome-api
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Minimum required configuration
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
```

### Step 4: Start Developing

```bash
npm run dev
```

Your API is now running at `http://localhost:5000` 🚀

Uses Node.js built-in `--watch` flag (Node 18+) - no nodemon needed!

### Step 5: Test Your API

```bash
# Health check
curl http://localhost:5000

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

---

## 📊 What You Get Out of the Box

| Feature | Included | Configuration Required |
|---------|----------|------------------------|
| ✅ Express.js Server | ✓ | Minimal |
| ✅ MongoDB + Mongoose | ✓ | Connection string only |
| ✅ JWT Authentication | ✓ | Secret key only |
| ✅ Password Hashing | ✓ | None |
| ✅ Input Validation | ✓ | None |
| ✅ Error Handling | ✓ | None |
| ✅ Security Headers | ✓ | None |
| ✅ Rate Limiting | ✓ | Optional tuning |
| ✅ CORS | ✓ | Optional tuning |
| ✅ Email Service | ✓ | SMTP credentials |
| ✅ Image Upload | ✓ | Cloudinary credentials |
| ✅ Logging | ✓ | None |
| ✅ API Documentation | ✓ | None |

---

## 🆚 Why Choose nodejs-fs?

<table>
<tr>
<th width="25%">Manual Setup</th>
<th width="25%">Express Generator</th>
<th width="25%">Other Boilerplates</th>
<th width="25%">nodejs-fs ⭐</th>
</tr>
<tr>
<td>

❌ Hours of setup

❌ Security gaps

❌ No auth included

❌ Basic structure

❌ No best practices

</td>
<td>

⚠️ Minimal setup

❌ No database

❌ No authentication

❌ Outdated patterns

⚠️ Basic only

</td>
<td>

⚠️ Overengineered

⚠️ Too opinionated

❌ Steep learning curve

⚠️ Hard to modify

⚠️ Limited docs

</td>
<td>

✅ 60-second setup

✅ Production-ready

✅ Full auth system

✅ Modern patterns

✅ Well documented

✅ Easy to customize

✅ Actively maintained

</td>
</tr>
</table>

---

## 📁 What's Included
