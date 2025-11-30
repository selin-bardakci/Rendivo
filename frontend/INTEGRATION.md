# Rendivo Frontend

Next.js frontend for the Rendivo appointment booking system with multiple authentication methods and user types.

## Features

- **Multiple User Types**: Customer, Staff, Business Owner signup flows
- **Authentication Methods**:
  - Email/Password (Local)
  - Google Sign-In (Firebase)
  - Facebook Login (Firebase)
  - Apple Sign-In (Firebase)
- **Role-Based Routing**: Automatic redirect based on user role
- **Protected Routes**: Authentication middleware for protected pages
- **Responsive Design**: Mobile-friendly UI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Firebase (Optional - for social login)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── components/          # Reusable React components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Nav.tsx         # Navigation component
│   └── ProtectedRoute.tsx
├── lib/                # Utility functions
│   ├── api.ts         # Axios API client
│   ├── auth.ts        # Authentication functions
│   ├── firebase.ts    # Firebase configuration
│   └── fcm.ts         # Firebase Cloud Messaging
├── pages/             # Next.js pages (routes)
│   ├── index.tsx      # Landing page
│   ├── login.tsx      # Login page
│   ├── signup.tsx     # Signup role selection
│   ├── signup/
│   │   ├── customer.tsx    # Customer registration
│   │   ├── staff.tsx       # Staff registration
│   │   └── business/       # Business registration (3 steps)
│   │       ├── step1.tsx   # Account basics
│   │       ├── step2.tsx   # Business details
│   │       └── step3.tsx   # Confirmation & submission
│   ├── customer/
│   │   └── dashboard.tsx   # Customer dashboard
│   ├── business/
│   │   ├── dashboard.tsx   # Business owner dashboard
│   │   ├── services.tsx    # Service management
│   │   ├── staff.tsx       # Staff management
│   │   └── schedule.tsx    # Schedule management
│   └── staff-dashboard.tsx # Staff member dashboard
├── public/            # Static assets
└── styles/           # CSS modules

```

## Authentication Flows

### Customer Registration
1. Navigate to `/signup` → Select "I'm a Customer"
2. Fill in: First Name, Last Name, Email, Phone, Password
3. Submit → Redirects to `/customer/dashboard`

**API Endpoint**: `POST /api/auth/register/customer`

### Staff Registration
1. Navigate to `/signup` → Select "I'm a Staff Member"
2. Fill in: Full Name, Email, Password, Business ID
3. Business ID is provided by the business owner
4. Submit → Redirects to `/staff-dashboard`

**API Endpoint**: `POST /api/auth/register/staff`

### Business Owner Registration (Multi-Step)
1. Navigate to `/signup` → Select "I'm a Business Owner"
2. **Step 1**: Account basics (Full Name, Email, Password)
3. **Step 2**: Business details (Name, Type, Address, Contact)
4. **Step 3**: Automatic submission & confirmation
5. Receive unique Business ID to share with staff
6. Redirects to `/business/dashboard`

**API Endpoint**: `POST /api/auth/register/business`

### Login
1. Navigate to `/login`
2. Enter Email and Password
3. Submit → Automatic redirect based on role:
   - Customer → `/customer/dashboard`
   - Staff → `/staff-dashboard`
   - Business Owner → `/business/dashboard`

**API Endpoint**: `POST /api/auth/login`

### Firebase Social Authentication (Optional)

If Firebase is configured, you can add social login buttons:

```tsx
import { signInWithGoogle, signInWithFacebook, signInWithApple } from '../lib/firebase'
import { authenticateWithFirebase } from '../lib/auth'

// Google Sign-In example
const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithGoogle()
    const firebaseToken = await result.user.getIdToken()
    
    await authenticateWithFirebase(firebaseToken, 'customer', {
      fullName: result.user.displayName,
      phone: result.user.phoneNumber
    })
    
    router.push('/customer/dashboard')
  } catch (error) {
    console.error('Google sign-in error:', error)
  }
}
```

## API Integration

The frontend communicates with the backend via the API client (`lib/api.ts`):

```typescript
import api from './api'

// All requests automatically include JWT token if available
const response = await api.get('/auth/profile')
const data = response.data
```

### Available Auth Functions

```typescript
import { 
  registerCustomer,
  registerStaff,
  registerBusiness,
  login,
  logout,
  getToken,
  getCurrentUser,
  hasRole
} from './lib/auth'

// Register a customer
await registerCustomer({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890'
})

// Login
const { token, user } = await login('user@example.com', 'password123')

// Check authentication
const currentUser = getCurrentUser()
const isBusinessOwner = hasRole('business_owner')

// Logout
logout()
```

## Protected Routes

Use the `ProtectedRoute` component to protect pages:

```tsx
import ProtectedRoute from '../components/ProtectedRoute'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected dashboard content</div>
    </ProtectedRoute>
  )
}
```

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | No* |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | No* |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | No* |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | No* |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | No* |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | No* |

*Firebase variables are only required if you want to use social authentication

## Common Issues

### CORS Errors
Make sure your backend has the correct CORS configuration:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

### API Connection Refused
Ensure the backend server is running on the correct port (default: 5000)

### Firebase Not Working
1. Check that all Firebase environment variables are set
2. Verify Firebase project configuration in the Firebase Console
3. Enable authentication providers (Google, Facebook, Apple) in Firebase Console

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

ISC
