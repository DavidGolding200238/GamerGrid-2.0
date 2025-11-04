# GamerGrid 2.0

GamerGrid 2.0 is a production-grade, full-stack web platform that curates gaming content, community engagement, and real-time news. It pairs a React/Vite frontend with an Express/TypeScript backend, backed by MySQL and AWS services, and is deployable to Elastic Beanstalk.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Development Scripts](#development-scripts)
- [Environment Variables](#environment-variables)
- [Backend API](#backend-api)
- [Deployment](#deployment)
  - [Elastic Beanstalk (Backend)](#elastic-beanstalk-backend)
  - [Static Hosting (Frontend)](#static-hosting-frontend)
- [Testing & Quality](#testing--quality)
- [Security Considerations](#security-considerations)
- [Roadmap Ideas](#roadmap-ideas)
- [License](#license)

---

## Features

- **Landing & Dashboard** – Branded entry experience, animated background, and personalized dashboard mosaic.
- **Game Discovery** – RAWG-integrated search, hero carousel, genre rails, filtering, and deep-dive overlays with media.
- **Community Hub** – Authenticated creation of communities, posts, threaded comments, likes, and admin moderation.
- **News Feed** – Paginated gaming headlines via NewsAPI, with sidebar highlights.
- **Authentication** – JWT-based login, registration, profile fetch, password reset, and email verification flow.
- **Media Uploads** – Asset uploads to local storage in development or S3 in production.
- **Analytics & Feedback** – Google Analytics page tracking, toast notifications, and responsive UI components.

---

## Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript  
- **Routing**: React Router 6  
- **Styling**: TailwindCSS 3, Radix UI components, custom canvas animations  
- **State/Data**: TanStack Query, `localStorage` persistence  
- **Build Tool**: Vite with SWC-based React transform  

### Backend

- **Runtime**: Node.js 20 with Express 4 (ES modules)  
- **Language**: TypeScript compiled via `tsc`  
- **Database**: MySQL (`mysql2/promise` pool)  
- **Storage**: AWS S3 (production) or filesystem (development)  
- **Email**: Nodemailer (Gmail SMTP by default)  
- **External APIs**: RAWG (games), NewsAPI (news)  

### Tooling

- Vitest for unit tests  
- Prettier for formatting  
- TailwindCSS Animate plugin  
- `concurrently` for multi-app dev workflow   

---

## Project Structure

```
.
├── backend/         # Contains the Express.js backend application
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/        # Contains the React frontend application
│   ├── src/
│   ├── package.json
│   └── ...
├── package.json     # Root package.json with monorepo scripts
└── README.md
```

---

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/download/) (Version 20.x or later)
-   [npm](https://www.npmjs.com/get-npm)
-   A running [MySQL](https://dev.mysql.com/downloads/mysql/) database instance.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/DavidGolding200238/GamerGrid-2.0.git
    cd GamerGrid-2.0
    ```

2.  **Install all dependencies:**
    This command installs dependencies for the root, `frontend`, and `backend` projects.
    ```sh
    npm run install:all
    ```

---

## Development Scripts

The following scripts are available in the root `package.json` to manage the monorepo workflow.

-   **`npm run dev`**: Starts both the frontend and backend development servers concurrently.
-   **`npm run build`**: Builds both frontend and backend applications for production.
-   **`npm start`**: Starts the production backend server (requires a prior build).
-   **`npm run test`**: Runs unit tests with Vitest.
-   **`npm run format.fix`**: Formats the entire codebase with Prettier.
-   **`npm run typecheck`**: Performs TypeScript type-checking across both `frontend` and `backend`.

---

## Environment Variables

Create a `.env` file in the `backend` directory to configure the server, database, and external service credentials.

```env
# backend/.env

# Server
PORT=3000

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=gamergrid

# Security
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=http://localhost:5173 # Or your frontend URL

# AWS (for S3 and other services)
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your_s3_bucket_name

# External APIs
RAWG_API_KEY=your_rawg_api_key
NEWS_API_KEY=your_news_api_key

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## Backend API

The backend exposes a RESTful API for all platform operations. Key endpoint categories include:
- `auth/` for user registration, login, and password management.
- `users/` for profile data.
- `communities/` for creating and managing communities.
- `posts/` and `comments/` for content management.
- `games/` for interacting with the RAWG API proxy.
- `news/` for fetching articles from the NewsAPI proxy.

---

## Deployment

### Elastic Beanstalk (Backend)

The backend is configured for deployment to AWS Elastic Beanstalk. The `.ebextensions` folder (if present) and `scripts/` contain helpers for bundling the application into a `.zip` file that follows the required layout for a Node.js environment on Amazon Linux.

- **`npm run build:backend`**: Compiles the TypeScript code.
- **`npm run bundle:zip`**: (From `backend` directory) Creates a `gamergrid-backend.zip` file ready for upload to Elastic Beanstalk.

### Static Hosting (Frontend)

The frontend is a static single-page application (SPA) that can be deployed to any static hosting provider like Vercel, Netlify, or AWS S3/CloudFront.

- **`npm run build:frontend`**: Creates a production-ready build in the `frontend/dist` directory.

---

## Testing & Quality

- **Type Safety**: Full TypeScript coverage in both frontend and backend to prevent common runtime errors.
- **Unit Tests**: `vitest` is used for running unit tests. Test files are located alongside their source files.
- **Linting & Formatting**: `prettier` enforces a consistent code style across the project.

---

## Security Considerations

- **Authentication**: JWTs are used to secure endpoints. Sensitive routes are protected with middleware that verifies token validity.
- **Password Security**: Passwords are never stored in plaintext. They are hashed using `bcrypt` before being saved to the database.
- **CORS**: The backend enforces a strict Cross-Origin Resource Sharing (CORS) policy to only allow requests from the designated frontend URL.
- **Environment Variables**: All sensitive keys, secrets, and configuration values are loaded from a `.env` file, which should never be committed to source control.

---

## Roadmap Ideas

- **Real-Time Chat**: Integrate WebSockets for live chat within communities.
- **Friend System**: Allow users to add and manage friends.
- **Game Library**: Let users track the games they are playing, have completed, or wish to play.
- **CI/CD Pipeline**: Automate testing and deployment using GitHub Actions.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
