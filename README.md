# NearMates 🌐 — Find Your People. Do Things Together.

[![Frontend Deployment](https://img.shields.io/badge/Vercel-Frontend%20Live-brightgreen?logo=vercel)](https://near-mates-lemon.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Render-API%20Live-blue?logo=render)](https://nearmates-api.onrender.com/)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20PostGIS-emerald?logo=supabase)](https://supabase.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A full-stack, hyper-local activity discovery and companion-matching platform engineered to connect nearby individuals around spontaneous real-world meetups within minutes — powered by **PostGIS geospatial indexing**, **HTML5 Canvas client-side optimization**, **Socket.io real-time chat**, and a **multi-tier Admin moderation console**.

---

## 🚀 Live Deployments

* **Frontend Web App:** [https://near-mates-lemon.vercel.app](https://near-mates-lemon.vercel.app)
* **Backend REST & WebSocket API:** [https://nearmates-api.onrender.com](https://nearmates-api.onrender.com)
* **API Health Check:** [https://nearmates-api.onrender.com/api/health](https://nearmates-api.onrender.com/api/health)

---

## ⚡ Key Highlights & Features

### 📍 1. Geospatial Proximity Discovery & Radar
* Real-world physical distance calculations on the WGS 84 ellipsoid using native **PostgreSQL + PostGIS** (`ST_DWithin`, `ST_Distance`).
* **GIST (Generalized Search Tree) spatial index** on `location_point GEOGRAPHY(Point, 4326)` delivering sub-30ms execution times.
* Dynamic radius exploration slider from 1 km to 50 km with instant card re-filtering.
* Jaccard interest similarity coefficient scoring to highlight compatible nearby users.

### 🤝 2. Spontaneous Activities & Attendance Machine
* Frictionless meetup creation with location pinning, start/end times, and category tagging.
* Atomic slot capacity reservation preventing race conditions when concurrent users join.
* Attendance lifecycle state machine (`pending` → `confirmed` → `completed` / `left`).

### 💬 3. Real-Time Chat & Coordination
* Low-latency WebSocket rooms multiplexed by `activity_id` using **Socket.io**.
* Instant message delivery with persistent chat history in PostgreSQL.
* Token-based authentication handshake validating JWT signatures on connection.

### 📷 4. Client-Side HTML5 Canvas Avatar Compression
* Custom client-side image optimization pipeline in `imageUtils.js`.
* Automatically compresses high-resolution camera uploads (5MB–12MB) down to ~35KB (<100ms) onto an off-screen HTML5 Canvas context.
* Zero server-side CPU transcoding bottlenecks and zero external image API subscription costs.

### 🛡️ 5. Comprehensive Admin & Community Moderation Console
* **A. Overview Dashboard:** Live counters for total registered users, active user velocity (DAU, WAU, MAU), total activities, and disciplinary status.
* **B. User Management:** Search all users, review warning histories, and permanently ban bad actors with mandatory justification logging.
* **C. Activity Management:** Filter by category/location, inspect participant rosters, and cancel unsafe or fraudulent gatherings.
* **D. Reports & Moderation:** Dedicated incident triage queue covering 7 violation categories (*Fake Profile, Harassment, Spam, Inappropriate Avatar, Suspicious Activity, Abusive Messages, Other*) with immutable audit logging.

### 🔄 6. Dual-Storage Repository Pattern
* Seamlessly connects to **Supabase PostgreSQL** in production.
* Features a zero-configuration **In-Memory Geodesic Repository** (utilizing the Haversine formula) for automated unit test runners, CI/CD pipelines, and local development without database dependencies.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 Client (Vite)               │
│     Tailwind CSS • Lucide Icons • Socket.io Client      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / WSS
┌───────────────────────────▼────────────────────────────┐
│                  Express.js API Gateway                │
│       JWT Auth Middleware • RBAC Admin Guards          │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
   ┌──────────▼──────────┐      ┌──────────▼──────────┐
   │ Controllers & Serv. │      │   Socket.io Server  │
   └──────────┬──────────┘      └──────────┬──────────┘
              │                            │
┌─────────────▼────────────────────────────▼─────────────┐
│               Repository Factory Interface             │
├──────────────────────────┬─────────────────────────────┤
│   Supabase Repository    │    In-Memory Geodesic Repo  │
│  PostgreSQL 15 + PostGIS │      Haversine Algorithm    │
│    (Production Mode)     │      (Testing / CI Mode)    │
└──────────────────────────┴─────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide React, Socket.io-client |
| **Backend** | Node.js (v18+), Express.js, Socket.io, `pg` (node-postgres), bcryptjs, jsonwebtoken |
| **Database & GIS** | PostgreSQL 15+, PostGIS 3.3+, Supavisor Connection Pooler |
| **Cloud Hosting** | Vercel (Client SPA), Render (REST & WebSocket Backend), Supabase (Managed DB) |

---

## 📂 Project Structure

```text
NearMates/
├── client/                     # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/         # Modals, Navbar, ActivityCards, ReportModal
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # Dashboard, AdminDashboard, Activities, Auth
│   │   ├── services/           # Axios REST API client & helpers
│   │   └── utils/              # imageUtils.js (Canvas compression)
│   ├── index.html
│   └── package.json
│
├── server/                     # Express.js REST & Real-time Backend
│   ├── database/               # schema.sql & migration DDL scripts
│   ├── seeds/                  # Taxonomy categories & mock seed data
│   ├── src/
│   │   ├── config/             # Environment variables & constants
│   │   ├── controllers/        # Express route handlers
│   │   ├── middleware/         # authMiddleware, requireAdmin, errorHandler
│   │   ├── repositories/       # supabaseRepository.js & inMemoryRepository.js
│   │   ├── routes/             # adminRoutes, activityRoutes, authRoutes, reportRoutes
│   │   └── services/           # Business logic & geospatial scoring
│   ├── tests/                  # Automated unit and integration test suite
│   └── package.json
│
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* Git

### 1. Clone the Repository
```bash
git clone https://github.com/kailashbi/NearMates.git
cd NearMates
```

### 2. Backend Setup
```bash
cd server
npm install

# Create environment configuration
cp .env.example .env

# Start in development mode (defaults to In-Memory fallback if no DB URL is set)
npm run dev
```
The server will start at `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install

# Create frontend environment configuration
cp .env.example .env

# Start Vite development server
npm run dev
```
The client application will open at `http://localhost:5173`.

---

## ⚙️ Environment Variables Reference

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=super-secret-jwt-key-for-nearmates-production-change-in-prod-123456

# Optional: Supabase PostgreSQL & PostGIS URI
# If omitted or invalid, the backend automatically activates the In-Memory Geodesic Repository
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=no-verify
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🧪 Testing & Verification

Run the automated test suite covering authentication, PostGIS fallback, activity participation, smart matching, and admin moderation:

```bash
# Run backend test suite (9 passing unit tests)
npm test --prefix server

# Run frontend production build test
npm run build --prefix client
```

---

## 🛡️ Default Administrator Account

NearMates comes with an initialized administrator account for platform governance:

* **Email:** `admin@nearmates.com`
* **Password:** `Password123!`
* **Admin Dashboard:** Navigate to `/admin` or click the **"Admin Mode"** pill in the top navigation.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
