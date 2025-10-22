# GamerGrid 2.0

A production-ready full-stack gaming platform with React frontend and Express backend.

## Project Structure

```
├── frontend/          # React Frontend Application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Route components 
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── App.tsx       # Main app component
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.ts    # Vite configuration
│   └── tsconfig.json     # TypeScript config
│
├── backend/           # Express Backend API
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── index.ts      # Express server setup
│   │   └── node-build.ts # Production server
│   ├── package.json      # Backend dependencies
│   └── tsconfig.json     # TypeScript config
│
├── shared/            # Shared types and utilities
│   └── api.ts            # API type definitions
│
└── package.json       # Root package.json for coordination
```

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: React Router 6
- **Styling**: TailwindCSS 3 + Radix UI
- **Build Tool**: Vite
- **State Management**: TanStack Query

### Backend  
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **API**: RESTful endpoints

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install all dependencies**:
```bash
npm run install:all
```

2. **Development Mode**:
```bash
npm run dev
```
This starts both frontend (usually port 5173) and backend (port 3000) concurrently.

3. **Production Build**:
```bash
npm run build
npm start
```

### Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend  
npm run dev:backend

# Build for production
npm run build

# Type checking
npm run typecheck

# Format code
npm run format.fix
```

## Features

- **Landing Page**: Welcome screen with sign-up/sign-in options
- **Games Gallery**: Browse games with filtering and search
- **User Authentication**: Sign-up and sign-in flows
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Modern UI**: Gaming-themed design with smooth animations

## API Endpoints

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint

## Environment Variables

Create `.env` files in the appropriate directories:

### Backend (.env)
```
PORT=3000
NODE_ENV=development
```

## Backend Deployment (Elastic Beanstalk)

1. Install dependencies and build the backend:
   ```bash
   cd backend
   npm ci
   npm run build
   ```
2. Verify the bundle layout:
   ```bash
   npm run bundle:check
   ```
3. Create the deployment archive:
   ```bash
   npm run bundle:zip
   ```
   The ZIP is written to `backend/deploy/backend-eb-YYYYMMDDHHMM.zip` and contains only:
   ```
   Procfile
   package.json
   package-lock.json
   dist/
   ```
4. Upload the generated ZIP to Elastic Beanstalk. At launch the server logs a line similar to:
   ```
   [DB] connecting { host: '...', user: process.env.DB_USER, db: process.env.DB_NAME }
   ```
   If the username does not match your EB environment variable, update the EB configuration before redeploying.
