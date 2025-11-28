# Secured Storage - Secure File Sharing Application

A complete secure file-sharing application with **AES-256 encryption**, **RSA-2048 key management**, **email verification**, and **password reset** functionality. Built with **React**, **Node.js (Express)**, **PostgreSQL (Sequelize)**, and **AWS S3**.

---

## 🚀 Features

### Security
- **AES-256 File Encryption** - Files are encrypted before upload to S3
- **RSA-2048 Key Management** - Each user has unique RSA key pairs
- **Email Verification** - Required for all new accounts
- **Password Reset** - Secure token-based password recovery
- **JWT Authentication** - Secure API authentication
- **Role-Based Access** - Users can only access their own files

### File Management
- **Encrypted Upload** - Files encrypted before S3 upload
- **File Preview** - Preview images, PDFs, and text files
- **File Download** - Secure decrypted file downloads
- **File Deletion** - Permanent removal from S3 and database
- **File Sharing** - Share files via email with download links

### User Features
- **User Registration** with email verification
- **Secure Login** with JWT tokens
- **Forgot/Reset Password** flow
- **Dashboard** with file management
- **Email Notifications** for sharing and verification

---

## 📦 Installation

### Backend (API)
```bash
cd api
npm install
```

### Frontend (App)
```bash
cd app
npm install
```

---

## 🔧 Configuration

### Backend `.env` File
Create `api/.env` with:

```env
# PostgreSQL Database (Supabase or local)
DATABASE_URL=postgresql://user:password@host:5432/database

# Or use individual variables:
DB_NAME=secured_storage
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# JWT Secret
JWT_SECRET=your-very-secret-key-change-this
JWT_EXPIRES_IN=7d

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket-name

# App URLs
APP_URL=http://localhost:3000
PORT=3001
```

### Using Supabase PostgreSQL

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your PostgreSQL connection string from Project Settings → Database
3. Add to `.env`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

---

## ▶️ Development

### Start Backend Server
```bash
cd api
npm run dev
```
Server runs on `http://localhost:3001`

### Start Frontend
```bash
cd app
npm start
```
App runs on `http://localhost:3000`

---

## 🌐 Deployment to Vercel

### Backend (API)
- Deploy to Vercel as serverless functions
- Set environment variables in Vercel dashboard
- Use Supabase PostgreSQL as database

### Frontend (App)
- Deploy to Vercel
- Set `REACT_APP_API_URL` environment variable

---

## 📁 Project Structure

```
Secured-Storage/
├── api/              → Node.js Express backend
│   ├── src/
│   │   ├── db/       → Sequelize models & database
│   │   ├── utils/    → Encryption utilities
│   │   ├── middleware/ → Authentication
│   │   ├── router.js → API routes
│   │   └── index.js  → Server entry
│   └── package.json
│
└── app/              → React frontend
    ├── src/
    │   ├── components/ → React components
    │   ├── pages/     → Page components
    │   ├── helpers/   → API helpers
    │   └── index.js   → App entry
    └── package.json
```

---

## 🔐 Security Features

- **Passwords**: Hashed with bcrypt (10 salt rounds)
- **Files**: Encrypted with AES-256-CBC before S3 upload
- **AES Keys**: Encrypted with user's RSA-2048 public key
- **Tokens**: JWT for authentication, UUID for verification/reset
- **Email Verification**: Required before file operations
- **Access Control**: Users can only access their own files

---

## 📝 API Endpoints

### Authentication
- `POST /api/users` - Register
- `POST /api/users/login` - Login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Files (Authenticated)
- `GET /api/files` - List user's files
- `POST /api/upload` - Upload encrypted files
- `GET /api/files/:id/preview` - Preview file
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### Sharing
- `GET /api/posts/:id` - Get shared post
- `GET /api/posts/:id/download` - Download as ZIP

---

Happy Secure Sharing! 🔒
