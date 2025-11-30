# Rendivo - Complete Setup Guide

Full-stack appointment booking system with multiple authentication methods.

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret

# Create MySQL database
mysql -u root -p
CREATE DATABASE rendivo;
exit

# Start backend server (will auto-create tables)
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local (API URL should match backend)

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  Port: 3000                                                  │
│  • Customer, Staff, Business signup pages                    │
│  • Role-based dashboards                                     │
│  • Firebase social auth (optional)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ JWT Authentication
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend (Express + TypeScript)            │
│  Port: 5000                                                  │
│  • Authentication APIs                                       │
│  • User management                                           │
│  • Business & Staff management                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┴───────────┐
            │                      │
┌───────────▼────────┐  ┌─────────▼──────────┐
│   MySQL Database   │  │  Firebase Admin    │
│   (Sequelize ORM)  │  │  (Optional)        │
│                    │  │                    │
│  • users           │  │  • Social auth     │
│  • businesses      │  │  • Token verify    │
│  • staff_members   │  │                    │
└────────────────────┘  └────────────────────┘
```

## Authentication Flows

### Customer Registration
```
Frontend: /signup/customer
    ↓
POST /api/auth/register/customer
    ↓
Backend: Create user with role='customer'
    ↓
Return: JWT token + user data
    ↓
Frontend: Redirect to /customer/dashboard
```

### Staff Registration
```
Frontend: /signup/staff (requires Business ID)
    ↓
POST /api/auth/register/staff
    ↓
Backend: 
  1. Validate Business ID
  2. Create user with role='staff'
  3. Link to business in staff_members table
    ↓
Return: JWT token + user data + business info
    ↓
Frontend: Redirect to /staff-dashboard
```

### Business Registration (3-Step)
```
Frontend: /signup/business/step1 (Account info)
    ↓
Frontend: /signup/business/step2 (Business details)
    ↓
Frontend: /signup/business/step3 (Auto-submit)
    ↓
POST /api/auth/register/business
    ↓
Backend:
  1. Create user with role='business_owner'
  2. Create business record
  3. Generate unique Business ID
    ↓
Return: JWT token + user data + business data + Business ID
    ↓
Frontend: Show Business ID + redirect to /business/dashboard
```

### Login
```
Frontend: /login
    ↓
POST /api/auth/login
    ↓
Backend: Verify credentials + return user role
    ↓
Return: JWT token + user data
    ↓
Frontend: Role-based redirect
  • customer → /customer/dashboard
  • staff → /staff-dashboard
  • business_owner → /business/dashboard
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/customer` | Register a customer | No |
| POST | `/api/auth/register/staff` | Register a staff member | No |
| POST | `/api/auth/register/business` | Register a business owner | No |
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/firebase` | Authenticate with Firebase token | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| POST | `/api/auth/logout` | Logout (optional endpoint) | Yes |

## Database Schema

### users
```sql
- id (PK)
- email (unique)
- password (hashed, nullable for OAuth)
- firstName, lastName, fullName
- phone
- role (enum: 'customer', 'staff', 'business_owner')
- authProvider (enum: 'local', 'firebase', 'google', 'facebook', 'apple')
- firebaseUid (unique, nullable)
- emailVerified (boolean)
- isActive (boolean)
- lastLogin (datetime)
- createdAt, updatedAt
```

### businesses
```sql
- id (PK)
- ownerId (FK → users.id)
- businessName
- businessType
- description
- address, city, state, zipCode, country
- phone, email, website
- logo
- businessId (unique - for staff to join)
- isActive (boolean)
- createdAt, updatedAt
```

### staff_members
```sql
- id (PK)
- userId (FK → users.id)
- businessId (FK → businesses.id)
- position
- isActive (boolean)
- joinedAt
- createdAt, updatedAt
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rendivo
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Firebase Admin (optional)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_PROJECT_ID=your-project-id
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Firebase Client (optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Testing the Setup

### 1. Test Backend Health
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","message":"Server is running"}
```

### 2. Test Customer Registration
```bash
curl -X POST http://localhost:5000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890"
  }'
```

### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```

### 4. Test Frontend Pages
- Navigate to `http://localhost:3000`
- Click "Sign Up"
- Test each registration flow (Customer, Staff, Business)
- Test login with created accounts

## Firebase Setup (Optional)

For social authentication (Google, Facebook, Apple):

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication providers in Firebase Console
3. Download service account key (for backend)
4. Copy web app configuration (for frontend)
5. Set environment variables in both backend and frontend

## Security Notes

- Never commit `.env` or `.env.local` files
- Change JWT_SECRET in production
- Use HTTPS in production
- Enable Firebase App Check for additional security
- Implement rate limiting for authentication endpoints
- Use strong passwords (minimum 6 characters enforced)

## Common Issues

### "Cannot connect to MySQL"
- Ensure MySQL is running: `mysql.server start` (macOS)
- Verify database exists: `CREATE DATABASE rendivo;`
- Check credentials in `.env`

### "CORS Error"
- Verify FRONTEND_URL in backend `.env` matches frontend URL
- Check CORS middleware configuration

### "Token is not valid"
- JWT_SECRET must be the same between requests
- Token might be expired (check JWT_EXPIRES_IN)

### "Firebase not initialized"
- Verify all Firebase environment variables are set
- Check Firebase service account JSON is valid

## Production Deployment

### Backend
1. Build TypeScript: `npm run build`
2. Set `NODE_ENV=production`
3. Use process manager (PM2, systemd)
4. Set up reverse proxy (nginx)
5. Use environment variables for secrets

### Frontend
1. Build Next.js: `npm run build`
2. Start production: `npm start`
3. Or deploy to Vercel/Netlify

## Support

For issues or questions:
- Backend README: `/backend/README.md`
- Frontend Integration Guide: `/frontend/INTEGRATION.md`

## License

ISC
