# FoodBae

> A mobile-first social food discovery platform where users explore restaurants through short-form food videos.

[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-1f2937?style=for-the-badge)](#backend)
[![Mobile](https://img.shields.io/badge/mobile-React%20Native%20%2B%20Expo-111827?style=for-the-badge)](#mobile-app)
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%2B%20Prisma-0f766e?style=for-the-badge)](#database)
[![Storage](https://img.shields.io/badge/media-Cloudinary-1d4ed8?style=for-the-badge)](#video-upload-setup)

FoodBae helps users discover where to eat by watching authentic food reels tied to real restaurants. The product combines the scrollable short-video experience of social apps with restaurant discovery, creator uploads, and restaurant-level video collections.

FoodBae is **not** a food delivery app. The platform is designed for:

- restaurant discovery
- food reels and short-form video
- community-driven food experiences
- creator-style uploads from real restaurants

---

## Table Of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [System Requirements](#system-requirements)
7. [Installation Guide](#installation-guide)
8. [Running The App](#running-the-app)
9. [Environment Variables](#environment-variables)
10. [Video Upload Setup](#video-upload-setup)
11. [API Overview](#api-overview)
12. [Development Workflow](#development-workflow)
13. [Testing](#testing)
14. [Troubleshooting](#troubleshooting)
15. [Contributing](#contributing)
16. [License](#license)

---

## Project Overview

FoodBae is a full-stack mobile application built around one core idea:

**help users decide where to eat by watching food videos from real restaurants.**

### Core user journey

1. A user signs up or logs in.
2. The user opens a vertical reels feed.
3. Each video is attached to a restaurant.
4. The user can explore restaurant details and related videos.
5. Restaurant owners can create restaurant pages and upload food videos.
6. Uploaded videos appear in the public feed and on restaurant detail pages.

### Product phases implemented

| Phase | Area | Status | Highlights |
| --- | --- | --- | --- |
| Phase 1 | Backend foundation | Implemented | Express server, Prisma, Supabase/Postgres, security middleware |
| Phase 2 | Authentication | Implemented | Signup, login, JWT auth, protected routes |
| Phase 3 | Restaurant discovery | Implemented | Create restaurant, list restaurants, detail screen, restaurant videos |
| Phase 4 | Video reels system | Implemented | Cloudinary uploads, feed pagination, secure file validation, mobile feed |

---

## Key Features

### Implemented

- Secure user signup and login with JWT authentication
- Protected restaurant creation and management
- Public restaurant discovery with pagination
- Vertical food video feed with cursor-based pagination
- Restaurant-specific video collections
- Owner-only food reel uploads
- Content-based video validation before upload
- Cloudinary-backed video hosting
- Mobile authentication persistence with AsyncStorage
- Web, iOS, and Android development support through Expo

### Backend hardening already included

- Helmet security headers
- Rate limiting
- CORS control
- Global error handling
- UUID validation for route parameters
- Startup-time database connectivity verification
- Safer disk-backed upload pipeline

---

## Tech Stack

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js | Runtime |
| Express | API server |
| TypeScript | Type safety |
| PostgreSQL (Supabase) | Primary database |
| Prisma ORM | Database access and schema management |
| JWT | Authentication |
| Cloudinary | Video storage and delivery |
| Multer | Multipart upload handling |
| file-type | Content-based upload validation |
| Helmet | Security headers |
| express-rate-limit | Abuse protection |
| Zod | Request validation |

### Mobile App

| Technology | Purpose |
| --- | --- |
| React Native | Cross-platform UI |
| Expo | Development platform and tooling |
| TypeScript | Type safety |
| Expo Router | File-based navigation |
| Axios | API communication |
| AsyncStorage | Token persistence |
| NativeWind | Tailwind-style utility classes |
| expo-video | Video playback |
| expo-image-picker | Video selection from device |
| @expo/vector-icons | Icon system |

> Note: Some early project notes referenced `expo-av` and `Iconly`. The current codebase uses `expo-video` and `@expo/vector-icons`, which is the supported stack in this repository.

---

## Architecture

FoodBae uses a modular full-stack structure with a separate backend API and Expo-based mobile client.

```text
┌────────────────────┐
│   Mobile Client    │
│  React Native App  │
└─────────┬──────────┘
          │ Axios / JWT
          ▼
┌────────────────────┐
│   Express API      │
│ auth / restaurants │
│ videos modules     │
└─────────┬──────────┘
          │ Prisma ORM
          ▼
┌────────────────────┐
│ PostgreSQL DB      │
│  (Supabase)        │
└────────────────────┘

          ┌────────────────────┐
          │   Cloudinary       │
          │ video asset store  │
          └────────────────────┘
```

### Backend module design

Each backend feature is grouped by module:

- `auth`
- `restaurants`
- `videos`

Each module follows the same pattern:

- `routes` for HTTP definitions
- `controller` for request/response handling
- `service` for business logic and persistence

This keeps the codebase easy to scale as new features like likes, comments, saves, and follows are added in future phases.

---

## Project Structure

```text
foodbae/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── types/
│   │   └── utils/
│   ├── tests/
│   └── tmp/
├── mobile/
│   ├── app/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── services/
│   └── types/
└── README.md
```

### Backend folders

| Folder | Purpose |
| --- | --- |
| `backend/prisma/` | Prisma schema, migrations, and database modeling |
| `backend/src/config/` | Shared infrastructure config such as Prisma and Cloudinary |
| `backend/src/middleware/` | Express middleware like JWT authentication |
| `backend/src/modules/` | Domain modules: `auth`, `restaurants`, `videos` |
| `backend/src/types/` | Type augmentation such as custom Express request typing |
| `backend/src/utils/` | Response helpers, validation utilities, and application errors |
| `backend/tests/` | Basic backend integration tests |
| `backend/tmp/` | Temporary upload directory used before Cloudinary transfer |

### Mobile folders

| Folder | Purpose |
| --- | --- |
| `mobile/app/` | Expo Router screens and route groups |
| `mobile/components/` | Reusable UI components like buttons, inputs, cards, loaders |
| `mobile/constants/` | Shared constants such as colors and API configuration |
| `mobile/hooks/` | Shared hooks such as authentication state |
| `mobile/services/` | API clients and feature-specific service wrappers |
| `mobile/types/` | Shared TypeScript types used by the app |

### Important mobile routes

| Route | Description |
| --- | --- |
| `/` | Root redirect to auth or feed |
| `/(auth)/login` | Login screen |
| `/(auth)/signup` | Signup screen |
| `/(tabs)/feed` | Vertical video feed |
| `/(tabs)/restaurants` | Restaurant listing screen |
| `/(tabs)/upload` | Video upload screen |
| `/(tabs)/profile` | Profile and logout screen |
| `/restaurants/[id]` | Restaurant detail page |

---

## System Requirements

Before running FoodBae locally, make sure your environment meets the following minimum requirements.

### Required software

| Tool | Minimum Version | Notes |
| --- | --- | --- |
| Node.js | 20.x or later | Recommended because the backend uses modern TypeScript/Node APIs |
| npm | 10.x or later | Comes with modern Node installations |
| Git | 2.40+ | For cloning and contributing |

### Mobile development tools

| Tool | Required For |
| --- | --- |
| Expo CLI via `npx expo` | Running the React Native app |
| Android Studio | Android emulator/device tooling |
| Xcode | iOS simulator and builds on macOS |
| Expo Go | Fast testing on a physical device |

---

## Installation Guide

This section walks through a full local setup from zero.

### 1. Clone the repository

```bash
git clone <repo-url>
cd foodbae
```

Replace `<repo-url>` with your GitHub repository URL.

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend/` directory.

You can start from the included template:

```bash
cp .env.example .env
```

Template:

```env
DATABASE_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Where to get these values

| Variable | Source |
| --- | --- |
| `DATABASE_URL` | Supabase project database connection string |
| `JWT_SECRET` | A strong random secret generated by you |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard |

#### Supabase credentials

1. Create or open your Supabase project.
2. Go to `Project Settings` -> `Database`.
3. Copy the PostgreSQL connection string.
4. Paste it into `DATABASE_URL`.

#### Cloudinary credentials

1. Sign in to [Cloudinary](https://cloudinary.com/).
2. Open the dashboard.
3. Copy your `Cloud name`, `API Key`, and `API Secret`.
4. Paste them into the backend `.env`.

### 4. Set up the database

Generate the Prisma client and apply migrations:

```bash
npm run db:generate
npm run db:migrate
```

What this does:

1. `db:generate` creates Prisma client code based on `schema.prisma`.
2. `db:migrate` applies schema migrations to your PostgreSQL database.

### 5. Start the backend server

```bash
npm run dev
```

Expected startup logs:

```text
Server running on port 3000
Database connected
Cloudinary configured
```

If the database is unreachable, the server will exit early with a clear message instead of starting in a broken state.

### 6. Install mobile dependencies

Open a second terminal:

```bash
cd mobile
npm install
```

### 7. Configure the mobile API URL

FoodBae reads the API base URL from Expo environment config.

Current behavior in the app:

```ts
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";
```

#### Recommended local setup

When testing on a physical device, use your machine's local network IP instead of `localhost`.

Example:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000/api npm run start
```

#### How to find your local IP

On macOS:

```bash
ipconfig getifaddr en0
```

On Linux:

```bash
hostname -I
```

On Windows:

```bash
ipconfig
```

Look for the IPv4 address on the same Wi-Fi/network as your mobile device.

---

## Running The App

### Start the mobile development server

From `mobile/`:

```bash
npm run start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

> iOS simulator support requires macOS with Xcode installed.

### Run on Web

```bash
npm run web
```

### Expo development options

| Option | Use Case |
| --- | --- |
| Expo Go | Fastest way to test on a physical phone |
| Android Emulator | Great for Android UI debugging |
| iOS Simulator | Best for iOS-specific testing on Mac |
| Web | Fast UI iteration for layout and routing |

---

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for Supabase |
| `JWT_SECRET` | Yes | Secret used for signing JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `PORT` | No | Express port, defaults to `3000` |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS allowlist |

### Mobile

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Recommended | Public backend API URL, especially for physical-device testing |

---

## Video Upload Setup

FoodBae supports secure restaurant-linked reel uploads using Cloudinary.

### Upload flow

1. A signed-in user selects a video from the mobile app.
2. The app sends a multipart request to `POST /api/videos/upload`.
3. The backend stores the file temporarily on disk.
4. The backend validates the file type using content inspection, not just file extension.
5. The video is uploaded to Cloudinary.
6. Video metadata is saved in PostgreSQL.
7. The uploaded reel appears in the global feed and on the restaurant page.

### Upload protections

| Protection | Details |
| --- | --- |
| Auth required | Only authenticated users can upload |
| Ownership enforced | A user can only upload for restaurants they own |
| File type validation | Only MP4 and QuickTime video types are accepted |
| File size limit | 100 MB |
| Error handling | Oversized files return HTTP `413 File too large` |

---

## API Overview

### Base URL

```text
http://localhost:3000/api
```

### Standard response shape

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error response:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

### Major endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Health check endpoint | No |
| `POST` | `/api/auth/signup` | Create a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user and return JWT | No |
| `GET` | `/api/auth/me` | Fetch current authenticated user | Yes |
| `GET` | `/api/restaurants` | Paginated restaurant listing | No |
| `POST` | `/api/restaurants` | Create a restaurant | Yes |
| `GET` | `/api/restaurants/:id` | Fetch restaurant details | No |
| `GET` | `/api/restaurants/:id/videos` | Fetch videos for a restaurant | No |
| `GET` | `/api/restaurants/me/owned` | Fetch restaurants owned by current user | Yes |
| `PATCH` | `/api/restaurants/:id` | Update a restaurant | Yes |
| `DELETE` | `/api/restaurants/:id` | Delete a restaurant | Yes |
| `GET` | `/api/videos/feed` | Fetch public reels feed | No |
| `POST` | `/api/videos/upload` | Upload a restaurant video | Yes |

### Example: signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "supersecret123"
}
```

### Example: login response

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "name": "Alex",
      "email": "alex@example.com"
    }
  },
  "message": "Logged in successfully."
}
```

### Example: feed pagination

```http
GET /api/videos/feed?limit=10&cursor=<opaque-cursor>
```

The feed uses cursor-based pagination ordered by:

1. `createdAt DESC`
2. `id DESC`

This avoids duplicate or skipped videos when timestamps are close together.

---

## Development Workflow

Recommended daily workflow for contributors:

### 1. Start the backend

```bash
cd backend
npm run dev
```

### 2. Start the mobile app

Open a second terminal:

```bash
cd mobile
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api npm run start
```

### 3. Test the core flow

1. Sign up a new user
2. Log in
3. Create a restaurant
4. Upload a food reel
5. Open the feed
6. Open restaurant detail and confirm the video appears

### 4. Validate API behavior

Use tools like:

- Postman
- Insomnia
- cURL
- browser devtools

### 5. Keep migrations in sync

If the schema changes:

```bash
cd backend
npm run db:migrate
npm run db:generate
```

---

## Testing

### Backend build

```bash
cd backend
npm run build
```

### Backend integration tests

```bash
cd backend
npm run test:integration
```

Current integration coverage includes:

- signup
- login
- create restaurant
- upload video
- fetch feed

---

## Troubleshooting

### 1. Database connection failed

Error example:

```text
Database connection failed. Verify DATABASE_URL.
```

#### Fix

- confirm the Supabase host is correct
- verify the database password
- make sure the Supabase project is running and not paused
- test the connection string directly from your machine

### 2. Expo app cannot reach the backend

#### Symptoms

- login fails on phone
- network request timeout
- requests work on web but not on device

#### Fix

- use your local IP instead of `localhost`
- ensure backend runs on `0.0.0.0`-reachable network interfaces if needed
- verify phone and computer are on the same network
- check firewall settings for port `3000`

### 3. Cloudinary upload failure

#### Symptoms

- upload returns `502`
- video never appears in feed

#### Fix

- verify Cloudinary credentials in `backend/.env`
- check file size and format
- confirm your Cloudinary account is active

### 4. Invalid video format

Error example:

```json
{
  "success": false,
  "message": "Only MP4 and QuickTime videos are allowed."
}
```

#### Fix

- upload `.mp4` or QuickTime-compatible files
- avoid renamed non-video files
- confirm the file is a real video, not just a changed extension

### 5. File too large

Error example:

```json
{
  "success": false,
  "message": "File too large"
}
```

#### Fix

- compress the video
- trim unnecessary duration
- keep uploads below `100 MB`

### 6. Expo web route shows unmatched route

#### Fix

- make sure the app root route exists at `mobile/app/index.tsx`
- restart Expo after route changes
- clear Metro cache if routing behaves unexpectedly

```bash
npm run start -- --clear
```

---

## Security Notes

FoodBae includes several important security practices by default:

- JWT-based route protection
- user existence verification during auth middleware
- rate limiting on both global API traffic and auth endpoints
- Helmet security headers
- UUID validation for route parameters
- safe error responses without leaking internal Prisma details
- content-based file validation before Cloudinary upload

### Security checklist for production

- never commit `.env`
- rotate secrets if they are ever exposed
- set strict `ALLOWED_ORIGINS`
- use strong `JWT_SECRET` values
- configure HTTPS in production
- monitor upload abuse and request spikes

---

## Contributing

Contributions are welcome.

### Recommended workflow

1. Fork the repository
2. Clone your fork
3. Create a branch
4. Make changes
5. Run tests
6. Commit with a clear message
7. Open a pull request

Example:

```bash
git checkout -b feature/improve-feed-state
git add .
git commit -m "Improve feed loading and empty state handling"
git push origin feature/improve-feed-state
```

### Contribution guidelines

- keep changes modular
- preserve API response formats
- add or update tests where needed
- document new environment variables
- avoid breaking existing mobile/backend contracts

---

## License

This project is licensed under the MIT License.

You can add a `LICENSE` file with the standard MIT text before publishing the repository publicly.

---

## Quick Start Summary

If you want the shortest path from clone to running app:

```bash
# 1. Clone
git clone <repo-url>
cd foodbae

# 2. Backend
cd backend
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev

# 3. Mobile (new terminal)
cd ../mobile
npm install
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api npm run start
```

Then:

1. Open Expo Go on your phone
2. Scan the QR code
3. Sign up
4. Create a restaurant
5. Upload your first food reel

---

Built for developers who want a clean starting point for a modern short-form video discovery product in the food space.
