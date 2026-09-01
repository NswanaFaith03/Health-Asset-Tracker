# UNZA DigiHealth - Health Asset Tracker

A comprehensive healthcare management system for the University of Zambia (UNZA) that provides mobile and web platforms for students, medical staff, and administrators.

## 🌟 Features

### Core Functionality
- **Student Portal**: Health consultations, queue management, notifications
- **Doctor Portal**: Consultation management, prescriptions, lab requests, queue handling
- **Nurse Portal**: Queue management, lab requests processing, vitals recording
- **Pharmacist Portal**: Prescription management and dispensing
- **Lab Technician Portal**: Lab request processing and results
- **Mental Health Counselor Portal**: Counseling sessions and support
- **HIV Professional Portal**: HIV support services and resources
- **Admin Portal**: Analytics, user management, emergency contact configuration

### Advanced Features
- **Modular Consultation Actions**: Doctors can dismiss/resolve consultations with reasons
- **Information Requests**: Medical staff can request additional information from students
- **Shift Management**: Medical staff can log in/out of shifts
- **Role-Based Access Control**: Granular permissions for each role
- **Real-time Notifications**: In-app notifications for consultation updates
- **Queue Management**: Smart queuing system with estimated wait times
- **Prescription Management**: Complete prescription workflow
- **Lab Request System**: Comprehensive lab testing workflow

## 🚀 Platform Support

### Mobile (React Native/Expo)
- **Android**: Production APK builds via EAS
- **iOS**: Supported (requires iOS configuration)
- **Expo Go**: Development testing

### Web (React Native Web)
- **Responsive Design**: Works on desktop and mobile browsers
- **Cross-Platform Storage**: localStorage for web, AsyncStorage for mobile
- **API Connectivity**: Proper backend integration for web platform
- **Production Ready**: Static export with Vercel deployment
- **URL**: https://health-asset-tracker.vercel.app

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React Native, Expo Router, TypeScript
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **API Client**: Generated from OpenAPI schema
- **State Management**: TanStack React Query
- **Authentication**: JWT tokens with role-based access
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: EAS Build (mobile), Vercel (web)

### Project Structure
```
Health-Asset-Tracker/
├── artifacts/
│   ├── digihealth/          # React Native mobile app
│   │   ├── app/             # Expo Router file-based routing
│   │   ├── components/      # Shared UI components
│   │   ├── contexts/        # React contexts (Auth, Theme)
│   │   ├── features/        # Modular feature implementations
│   │   ├── hooks/           # Custom React hooks
│   │   └── constants/       # Design tokens and constants
│   └── api-server/          # Express.js backend
│       ├── src/
│       │   ├── routes/      # API route handlers
│       │   ├── middlewares/ # Authentication and authorization
│       │   └── lib/         # Utility functions
│       └── db/              # Database schema and migrations
├── lib/
│   ├── api-client-react/    # Generated API client
│   └── db/                  # Shared database schema
└── public/                  # Static web assets
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- pnpm (package manager)
- PostgreSQL database
- Expo CLI

### Installation
```bash
# Clone the repository
git clone https://github.com/NswanaFaith03/Health-Asset-Tracker.git
cd Health-Asset-Tracker

# Install dependencies
pnpm install

# Environment variables are already configured in .env.local
# DATABASE_URL is set for Neon PostgreSQL database
```

### Database Setup
```bash
# Run database migrations
cd artifacts/api-server
pnpm run db:push

# Seed default admin account
pnpm run seed
```

### Running the Application

#### 🚀 Web Development (Full CRUD Operations)

**IMPORTANT**: For web CRUD operations to work, you must run both the backend API server and the web frontend.

**Step 1: Start the Backend API Server**
```bash
cd artifacts/api-server
# Set the database URL from .env.local
export DATABASE_URL="postgresql://neondb_owner:npg_0PDLmV2uXvWT@ep-round-night-at8gqed4-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
pnpm run dev
```

The backend will start on `http://localhost:5000`

**Step 2: Start the Web Frontend**
```bash
cd artifacts/digihealth
npx expo start --web
```

The web frontend will start on `http://localhost:8081`

**Access the Web App**: Open http://localhost:8081 in your browser

**Note**: The web version is configured to use the local development API (http://localhost:5000) by default for development. CRUD operations will only work when both services are running.

#### 📱 Mobile Development
```bash
cd artifacts/digihealth
npx expo start

# For Android
npx expo start --android

# For iOS
npx expo start --ios
```

#### 🔧 Backend API Only
```bash
cd artifacts/api-server
export DATABASE_URL="postgresql://neondb_owner:npg_0PDLmV2uXvWT@ep-round-night-at8gqed4-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
pnpm run dev
```

## 🎨 Design System

### Theme
- **Primary Color**: `#10b981` (Emerald Green)
- **Secondary Color**: `#059669` (Dark Emerald)
- **Accent Color**: `#14b8a6` (Teal)
- **Radius**: 14px
- **Typography**: Inter font family

### Visual Style
- Modern, clean interface with green/teal theme
- Semi-transparent overlays for text readability
- Background photography with content separation
- Smooth animations and transitions
- Responsive design for web and mobile

## 🔐 Authentication & Authorization

### Authentication Flow
1. User logs in with email/password
2. Backend validates credentials and returns JWT token
3. Token stored in platform-appropriate storage (localStorage/web, AsyncStorage/mobile)
4. API client automatically includes token in requests
5. Token refresh mechanism for extended sessions

### Role-Based Access Control
- **student**: Access to personal consultations, queue position
- **doctor**: Consultation management, prescriptions, lab requests
- **nurse**: Queue management, vitals recording, lab processing
- **pharmacist**: Prescription dispensing
- **lab_technician**: Lab request processing
- **mental_health_counselor**: Counseling sessions
- **hiv_professional**: HIV support services
- **admin**: Full system access and configuration

## 📡 API Integration

### Base URL Configuration
- **Development**: `http://localhost:5000`
- **Production**: `https://health-asset-tracker.vercel.app`
- **Environment Variable**: `EXPO_PUBLIC_API_URL`

### API Endpoints
- Authentication: `/api/auth/login`, `/api/auth/register`
- Consultations: `/api/consultations`, `/api/consultations/:id/actions`
- Queue: `/api/queue`, `/api/queue/join`, `/api/queue/:id/complete`
- Prescriptions: `/api/prescriptions`
- Lab Requests: `/api/lab`
- Dashboard: `/api/dashboard/doctor`, `/api/dashboard/student`
- Admin: `/api/admin/analytics`, `/api/admin/emergency-phone`

## 🌐 Web Deployment

### Vercel Configuration
```json
{
  "version": 2,
  "buildCommand": "cd artifacts/digihealth && pnpm exec expo export -p web",
  "outputDirectory": "artifacts/digihealth/dist",
  "installCommand": "pnpm install",
  "framework": "expo"
}
```

### Production Build
```bash
# Build static web export
cd artifacts/digihealth
npx expo export -p web

# Deploy to Vercel (automatic on git push)
git push origin main
```

### Live URL
**https://health-asset-tracker.vercel.app**

## 📱 Mobile Deployment

### EAS Build Configuration
```json
{
  "production": {
    "android": {
      "buildType": "apk"
    },
    "env": {
      "EXPO_PUBLIC_API_URL": "https://health-asset-tracker.vercel.app"
    }
  }
}
```

### Building Production APK
```bash
cd artifacts/digihealth
eas build --platform android --profile production
```

## 🧪 Testing

### Type Checking
```bash
# Check TypeScript for mobile app
cd artifacts/digihealth
pnpm run typecheck

# Check TypeScript for API server
cd artifacts/api-server
pnpm run typecheck
```

### Manual Testing
1. Test authentication flow for all roles
2. Verify consultation CRUD operations
3. Test queue management system
4. Validate shift management functionality
5. Check API connectivity on web platform
6. Test responsive design on different screen sizes

## 🔄 Recent Updates

### Web Platform Enhancements
- ✅ Fixed API connectivity for web platform
- ✅ Implemented cross-platform storage (localStorage/web, AsyncStorage/mobile)
- ✅ Enhanced authentication context for web compatibility
- ✅ Updated consultation actions for web platform
- ✅ Improved API URL resolution for development environment

### Consultation System Improvements
- ✅ Implemented modular consultation action system
- ✅ Added dismiss/resolve functionality with reasons
- ✅ Information request workflow for medical staff
- ✅ Polymorphic role-based action permissions
- ✅ Enhanced consultation schema with new fields

### UI/UX Improvements
- ✅ Replaced purple theme with green/teal color scheme
- ✅ Added semi-transparent overlays for text readability
- ✅ Enhanced ScreenHeader component with modern design
- ✅ Improved consultation detail screens
- ✅ Shift management toggle for medical staff

## 🐛 Known Issues & Troubleshooting

### Web Platform Issues
- **CRUD Operations Not Working**: Ensure backend API server is running on port 5000
  ```bash
  cd artifacts/api-server
  export DATABASE_URL="postgresql://neondb_owner:npg_0PDLmV2uXvWT@ep-round-night-at8gqed4-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
  pnpm run dev
  ```
- **API Not Connecting**: Check that both backend (port 5000) and frontend (port 8081) are running
- **Storage Issues**: localStorage vs AsyncStorage compatibility handled in AuthContext
- **TypeScript Errors**: Web-specific style properties may need type assertions

### Mobile Platform Issues
- **EAS Build Failures**: Check EAS project configuration and API keys
- **Route Navigation Issues**: Ensure route paths are properly formatted
- **AsyncStorage Issues**: Ensure AsyncStorage is properly installed

### Backend Issues
- **Database Connection Error**: Ensure DATABASE_URL is set from .env.local file
- **Port Already in Use**: Kill existing processes on port 5000 (`pkill -f node`)
- **Migration Errors**: Run database migrations if schema changes

## 📞 Support

For issues or questions:
- **GitHub Issues**: https://github.com/NswanaFaith03/Health-Asset-Tracker/issues
- **Documentation**: Check project-specific documentation in code comments
- **Deployment**: Review Vercel and EAS Build logs

## 📄 License

Proprietary - University of Zambia DigiHealth Project

## 👥 Development Team

**Core Contributors**:
- **Joshua**: Security, Authentication, Core Platform Lead
- **Faith**: Student Portal Implementation
- **AAron**: Clinical Systems Architecture, Doctor Portal
- **Khadijah**: Prescription and Lab Systems
- **Moses**: Mental Health and HIV Support Services

**Special Thanks**:
- Devin AI Integration for development assistance

---

**Generated**: September 2025
**Version**: 1.0.0
**Status**: Production Ready