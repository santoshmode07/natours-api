# 🏕️ Natours SPA — Modern Full-Stack Booking Platform

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Render](https://img.shields.io/badge/Hosting-Render-46E3B7?logo=render&logoColor=white)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Hosting-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

Natours is a premium, high-performance, full-stack tour booking application. Originally built as a legacy Pug server-rendered project, it has been fully re-engineered into a modern **Decoupled Single Page Application (SPA)** with a React frontend and a secure Express REST API backend.

---

## ✨ Features & Enhancements

### 🎨 Modern Frontend (React SPA)
* **Single Page Application**: Instant page transitions powered by React Router client-side routing.
* **Premium Loading Skeletons**: Handcrafted pulsed-opacity layout-accurate skeletons (`Overview`, `Tour Detail`, `Bookings`, and `Reviews` dashboards) preventing layout shifts.
* **Global Auth Context**: Session state management via context provider with secure HTTP-Only cross-site cookie persistence.
* **Interactive Reviews & Bookings**: Integrated dashboard interfaces to manage booked tours and submit tour reviews.

### ⚡ Secure API Backend
* **Decoupled Architecture**: Separated concerns hosting the frontend on Vercel and the REST API on Render.
* **Brevo REST HTTP API Integration**: Email delivery (Welcome, OTP, Password Reset) runs via Brevo's direct HTTP POST API (Port `443` HTTPS), completely bypassing SMTP port blockages on cloud providers.
* **Robust Stripe Integration**: Real-time Stripe checkout session generation with automatic verification callbacks.
* **DB-First Server Startup**: Guaranteed database connectivity before port binding to prevent 500 errors during restart cycles.

---

## 🛠️ Tech Stack & Services

| Layer | Technology / Service | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, React Router 7, Axios | Client logic, SPA routing, backend communication. |
| **Build Tools** | Vite | Ultra-fast production packaging. |
| **Backend** | Node.js, Express | REST API, route guarding, payment management. |
| **Database** | MongoDB + Mongoose | Data models for Users, Tours, Bookings, Reviews, and OTPs. |
| **Payments** | Stripe | Payment processing and checkout flows. |
| **Emails** | Brevo REST API, Axios | Direct HTTP email notifications. |
| **Security** | Helmet, CORS, Rate Limit, Mongo Sanitize, XSS | Comprehensive OWASP protection layer. |

---

## 📂 Project Structure

```text
├── app.js                       # Express configuration & global error handling
├── server.js                    # Database connection & server lifecycle
├── render.yaml                  # Infrastructure-as-code for Render deployment
├── config.env                   # Env configurations (Excluded from git)
├── controllers/                 # Express Request Handlers
│   ├── authController.js        # JWT generation, signups, OTP verifications
│   ├── bookingController.js     # Stripe checkouts, booking records
│   ├── errorController.js       # Production vs development error responses
│   └── ...
├── models/                      # MongoDB schemas & validations
│   ├── bookingModel.js
│   ├── tourModel.js
│   ├── userModel.js
│   └── verifyModel.js           # TTL verified OTP codes (expires in 10m)
├── routes/                      # API endpoint configurations
├── Utils/                       # Core utility helpers
│   ├── email.js                 # Brevo REST API dispatcher
│   └── ...
└── frontend/                    # Vite + React Client
    ├── src/
    │   ├── App.jsx              # Main routing entries
    │   ├── components/          # Reusable UI (Skeletons, Headers, ProtectedRoute)
    │   ├── context/             # AuthContext session states
    │   └── pages/               # Views (Overview, TourDetail, Account, Bookings, Reviews)
    ├── vercel.json              # SPA routing rewrites for Vercel
    └── .env.production          # Frontend build variables
```

---

## 🔐 Environment Configurations

### Backend (`config.env`)
Create a `config.env` file at the root level of your backend project:
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://natours-api-two.vercel.app

DATABASE=mongodb+srv://<user>:<password>@cluster.mongodb.net/natours
DATABASE_PASSWORD=your_mongodb_password

JWT_SECRET=your_jwt_signing_secret_phrase
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=hello@natours.com

STRIPE_SECRET_KEY=your_stripe_test_secret_key
```

### Frontend (`frontend/.env.production`)
Create a `.env.production` inside the `/frontend` subfolder:
```env
VITE_API_URL=https://natours-backend.onrender.com
```

---

## 🚀 Standalone Deployments

### 1. Backend on Render
1. Connect your repository to **Render**.
2. Select **Web Service**.
3. Apply the following settings:
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
4. Add all environment variables from `config.env` (specifically `FRONTEND_URL`, `DATABASE`, `BREVO_API_KEY`, etc.) inside Render's **Environment** tab.

### 2. Frontend on Vercel
1. Connect your repository to **Vercel**.
2. Set the **Root Directory** settings to **`frontend`** (essential!).
3. Add the following environment variable:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://your-render-backend-url.onrender.com`
4. Deploy. Vercel will automatically compile the React build using `npm run build` (Vite) and serve it.

---

## 🔒 Security Middleware

* **CORS Settings**: Fully configured to accept cross-site requests with credentials from registered Vercel subdomains.
* **HTTP-Only Cookies**: JWT authentication token is issued as a secure, HTTP-Only cookie with `sameSite: 'none'` (cross-site) inside production, preventing XSS thefts.
* **Rate Limiting**: Protects backend APIs against brute-force attacks (`100` calls / IP / Hour).
* **Data Sanitization**: Prevents SQL/NoSQL injection via `express-mongo-sanitize` and XSS scripts via `xss-clean`.

---

## 🧪 Dev Operations & Seed Data

### Seeding database
To populate MongoDB with starter tours, guides, and reviews:
```bash
# Seed all database records
node dev-data/data/import-dev-data.js --import

# Delete all database records
node dev-data/data/import-dev-data.js --delete
```

### Local Development
```bash
# Start backend API (localhost:3000)
npm run dev

# Start frontend client (localhost:5173)
cd frontend && npm run dev
```

---

## 🛡️ License
Distributed under the ISC License. Created as an advanced full-stack learning platform.
