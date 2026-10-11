# Authentication & Product CRUD 🛒

A full-stack, student-friendly e-commerce web application featuring robust **JWT Authentication** (short-lived Access Tokens + secure HttpOnly Refresh Tokens) and complete **Product CRUD operations**.

This application is built from scratch with an **Express.js** backend using an **in-memory data layer** (ready for future MongoDB integration) and a modern **React + Vite** frontend.

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation & Quick Start](#installation--quick-start)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints Reference](#api-endpoints-reference)
- [Architecture & Flows](#architecture--flows)
  - [Authentication Flow](#authentication-flow)
  - [Silent Refresh Token Flow](#silent-refresh-token-flow)
  - [Product CRUD Flow](#product-crud-flow)
- [In-Memory Data Store & Limitations](#in-memory-data-store--limitations)
- [Future MongoDB Integration Guide](#future-mongodb-integration-guide)
- [Automated & Manual Testing Instructions](#automated--manual-testing-instructions)
- [GitHub Setup](#github-setup)
- [Deployment Preparation (Vercel & Render/Railway)](#deployment-preparation-vercel--renderrailway)

---

## 🌟 Project Overview

This project serves as a comprehensive reference implementation for modern web authentication patterns and resource management:
- **Zero Database Dependency to Start:** Out of the box, it uses a modular in-memory repository pattern so students and developers can run and test the application instantly without configuring a database or local MongoDB daemon.
- **Production-Grade Auth:** Implements industry best practices using 15-minute access tokens in frontend memory and 7-day refresh tokens securely stored in server-side memory and sent via `HttpOnly`, `SameSite` cookies to protect against XSS and CSRF attacks.
- **Clean Separation of Concerns:** Route definitions, controllers, middleware, validators, and data stores are organized into distinct layers.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **User Registration:** Validates name, email, password, and confirmation with `express-validator`. Hashes passwords with `bcryptjs` (salt rounds: 10). Rejects duplicate emails with HTTP 409 Conflict.
- **User Login:** Verifies credentials, generates a 15-minute Access Token (JWT) and a 7-day Refresh Token (JWT). Stores the refresh token server-side and attaches it via an `HttpOnly` cookie.
- **Silent Refresh Token Rotation:** Centralized Axios response interceptor automatically catches `401 Unauthorized` responses when the access token expires, requests a fresh access token using the HttpOnly cookie, and transparently retries the failed request.
- **Secure Logout:** Revokes the refresh token from server-side memory and clears the client cookie.
- **Protected Profile (`/me`):** Retrieves the authenticated user's profile using the Bearer access token.

### 📦 Product CRUD & Management
- **Public Product Catalog:** Anyone can browse products and inspect details. Supports pagination (`?page=1&limit=10`), real-time search, and category filtering.
- **Pre-seeded Products:** Initialized with 5 sample products with images and details on startup.
- **Authenticated CRUD:** Logged-in users can add new products, edit existing listings, and delete products with confirmation dialogs.
- **Input Validation:** Strict express-validator rules on title, category, positive price, non-negative integer stock, and valid image URLs.

---

## 🛠️ Tech Stack

### Frontend
- **React (v18)** - Component-based user interface
- **Vite** - High-performance frontend build tool and dev server
- **React Router (v6)** - Client-side SPA routing and protected route guards
- **Axios** - HTTP client configured with request/response interceptors for silent token refreshing
- **Lucide React** - Modern, lightweight icon suite
- **Vanilla CSS** - Responsive custom design system (variables, flexbox, CSS grid, modals, badges)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - REST API server
- **jsonwebtoken (JWT)** - Token generation and signature verification
- **bcryptjs** - Salted password hashing
- **express-validator** - Declarative input validation and sanitization
- **cookie-parser** - HttpOnly cookie parsing
- **cors** - Cross-Origin Resource Sharing with credentials support

---

## 📂 Folder Structure

```
auth-product-crud/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       # Auth logic: register, login, refresh, logout, me
│   │   │   └── productController.js    # Product logic: CRUD operations & pagination
│   │   ├── routes/
│   │   │   ├── authRoutes.js           # Auth route declarations
│   │   │   └── productRoutes.js        # Product route declarations
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # Bearer JWT access token verification
│   │   │   ├── errorHandler.js         # Centralized error handler & 404 handler
│   │   │   └── validate.js             # express-validator formatter
│   │   ├── validators/
│   │   │   ├── authValidators.js       # Registration & login validation rules
│   │   │   └── productValidators.js    # Product creation & update validation rules
│   │   ├── services/
│   │   │   ├── userService.js          # User business logic and bcrypt hashing
│   │   │   ├── tokenService.js         # JWT signing, verification, and revocation
│   │   │   └── productService.js       # Product filtering, pagination, and data access
│   │   └── data/
│   │       └── store.js                # In-memory arrays & Set for users, products, tokens
│   ├── app.js                          # Express application setup, CORS & middleware
│   ├── server.js                       # Server entry point and port listener
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertMessage.jsx        # Notification banners for success/errors
│   │   │   ├── ConfirmModal.jsx        # Delete confirmation dialog
│   │   │   ├── LoadingSpinner.jsx      # Loading states
│   │   │   ├── Navbar.jsx              # Responsive header with auth states
│   │   │   ├── ProductCard.jsx         # Card component with stock badges & actions
│   │   │   └── ProtectedRoute.jsx      # Auth route guard
│   │   ├── pages/
│   │   │   ├── AddProduct.jsx          # Form to create new products
│   │   │   ├── EditProduct.jsx         # Form to modify existing products
│   │   │   ├── Login.jsx               # User login page
│   │   │   ├── ProductDetails.jsx      # Detailed single product view
│   │   │   ├── Products.jsx            # Product catalog, search, and pagination
│   │   │   ├── Profile.jsx             # User account profile view (/me)
│   │   │   └── Register.jsx            # User registration page
│   │   ├── services/
│   │   │   └── api.js                  # Centralized Axios client & refresh interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # React context for auth state & methods
│   │   ├── hooks/
│   │   │   └── useAuth.js              # Convenience hook for AuthContext
│   │   ├── App.jsx                     # Route definitions
│   │   ├── main.jsx                    # React root entry point
│   │   └── index.css                   # Global stylesheet and responsive styles
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or higher (Tested with Node.js v24.x)
- **npm**: v9.0.0 or higher (Tested with npm v11.x)

---

## 🚀 Installation & Quick Start

### 1. Backend Setup

Open a terminal in the project directory:

```bash
cd auth-product-crud/backend
npm install
```

Create your `.env` file (you can copy `.env.example`):

```bash
cp .env.example .env
```

Start the backend server:

```bash
# Production/Standard mode:
npm start

# Development mode (auto-reload on file changes):
npm run dev
```

The backend will start at: `http://localhost:5000`

### 2. Frontend Setup

Open a second terminal window:

```bash
cd auth-product-crud/frontend
npm install
```

Create your `.env` file (you can copy `.env.example`):

```bash
cp .env.example .env
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will start at: `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Port number the Express API runs on | `5000` |
| `ACCESS_TOKEN_SECRET` | Secret key used to sign access JWTs | `change_this_access_secret` |
| `REFRESH_TOKEN_SECRET` | Secret key used to sign refresh JWTs | `change_this_refresh_secret` |
| `ACCESS_TOKEN_EXPIRES_IN` | Duration access token remains valid | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Duration refresh token remains valid | `7d` |
| `FRONTEND_URL` | Allowed origin for CORS cookies and headers | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for all backend API calls | `http://localhost:5000/api` |

> ⚠️ **Note:** In production, replace `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` with strong, random 256-bit hexadecimal strings.

---

## 📡 API Endpoints Reference

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account. Returns 201 or 409. |
| `POST` | `/api/auth/login` | Public | Authenticate user, set HttpOnly cookie, return access token. |
| `POST` | `/api/auth/refresh-token` | Public (Cookie) | Read HttpOnly cookie, return fresh access token. |
| `POST` | `/api/auth/logout` | Public | Revoke refresh token and clear client cookie. |
| `GET` | `/api/auth/me` | **Protected** | Retrieve authenticated user's profile. |

#### Standard Validation Error Response Format (HTTP 400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

### 2. Products (`/api/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products. Supports `?page=1&limit=10&search=&category=`. |
| `GET` | `/api/products/:id` | Public | Retrieve a single product by its ID. |
| `POST` | `/api/products` | **Protected** | Create a new product. |
| `PUT` | `/api/products/:id` | **Protected** | Update an existing product. |
| `DELETE` | `/api/products/:id` | **Protected** | Remove a product from the database. |

---

## 🔄 Architecture & Flows

### Authentication Flow
```
User (Browser)               Frontend (React)               Backend (Express)
      |                             |                               |
      |-- 1. Fill Register Form --->|                               |
      |                             |-- 2. POST /api/auth/register->| (Validates & hashes with bcrypt)
      |                             |<-- 3. HTTP 201 Created -------| (No tokens created here)
      |                             |                               |
      |-- 4. Fill Login Form ------>|                               |
      |                             |-- 5. POST /api/auth/login --->| (Verifies password)
      |                             |<-- 6. Access Token in JSON ---| (Stores Refresh Token in Set)
      |                             |       + HttpOnly Cookie ------| (Sent in Set-Cookie header)
      |                             |                               |
      |                             |-- 7. Store Access Token ----->|
      |                             |      in Memory (React State)  |
```

### Silent Refresh Token Flow
```
Frontend (Axios Interceptor)                       Backend (Express)
      |                                                   |
      |-- 1. GET /api/products/new (Expired Token) ------>|
      |<-- 2. HTTP 401 Unauthorized (TOKEN_EXPIRED) ------|
      |                                                   |
      |-- 3. Pause request & POST /api/auth/refresh-token | (Browser sends HttpOnly cookie automatically)
      |      (credentials: 'include') ------------------->|
      |                                                   | Checks refresh token in memory store
      |<-- 4. HTTP 200 OK + New Access Token -------------|
      |                                                   |
      |-- 5. Update In-Memory Token                       |
      |-- 6. Retry Original Request with New Token ------>|
      |<-- 7. HTTP 200 OK (Success!) ---------------------|
```

### Product CRUD Flow
- **Create (`POST /api/products`)**: Requires Bearer header. Validates name, description, positive price, stock, category.
- **Read (`GET /api/products`)**: Publicly accessible. Returns paginated results with metadata (`total`, `totalPages`, `page`, `limit`).
- **Update (`PUT /api/products/:id`)**: Requires Bearer header. Verifies product exists, updates fields, updates `updatedAt`.
- **Delete (`DELETE /api/products/:id`)**: Requires Bearer header. Removes item from memory and returns deleted ID.

---

## 💾 In-Memory Data Store & Limitations

> ⚠️ **Important:**
> The current backend stores data inside JavaScript runtime memory (`backend/src/data/store.js`).
> - Any newly registered users, created products, or token revocations will **reset to the default sample state whenever the Node.js server process restarts**.
> - This in-memory architecture is ideal for development, local learning, classroom assignments, and rapid testing without external services.

---

## 🍃 Future MongoDB Integration Guide

The application was purposefully designed with a clean separation of concerns so that MongoDB with Mongoose can be introduced with zero changes to controllers:

1. **Install Mongoose in backend**:
   ```bash
   cd backend
   npm install mongoose
   ```
2. **Add `MONGODB_URI` to `backend/.env`**:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```
3. **Create Mongoose Models** (e.g. `backend/src/models/User.js` & `backend/src/models/Product.js`).
4. **Update Service Layer**:
   Replace operations in `backend/src/services/userService.js` and `backend/src/services/productService.js` with standard Mongoose queries (`User.findOne`, `Product.find().skip().limit()`, etc.).
5. **No controller or frontend code needs to be modified.**

---

## 🧪 Testing Instructions

### Automated API Verification Script

A PowerShell automated test script is provided in the repository to test all endpoints end-to-end:

```powershell
# From project root:
powershell -ExecutionPolicy Bypass -File ./test-endpoints.ps1
```

### Manual Testing with cURL

#### 1. Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Smith\",\"email\":\"alice@example.com\",\"password\":\"password123\",\"confirmPassword\":\"password123\"}"
```

#### 2. Duplicate registration test (Expect HTTP 409):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Smith\",\"email\":\"alice@example.com\",\"password\":\"password123\",\"confirmPassword\":\"password123\"}"
```

#### 3. Login:
```bash
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"alice@example.com\",\"password\":\"password123\"}"
```
*(Notice the `Set-Cookie: refreshToken=...; HttpOnly` header and access token in response)*

#### 4. Fetch User Profile (/me):
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <PASTE_YOUR_ACCESS_TOKEN>"
```

#### 5. Create a Product (Protected):
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PASTE_YOUR_ACCESS_TOKEN>" \
  -d "{\"name\":\"Mechanical Numpad\",\"description\":\"Wireless mechanical number pad with hot swap switches\",\"price\":34.99,\"stock\":12,\"category\":\"Accessories\"}"
```

#### 6. Get All Products (Public):
```bash
curl "http://localhost:5000/api/products?page=1&limit=5"
```

---

## 🐙 GitHub Setup

To push this repository to GitHub:

1. Initialize git and commit:
   ```bash
   cd auth-product-crud
   git init
   git add .
   git commit -m "Initial commit: Authentication & Product CRUD fullstack app"
   ```
2. Create a new repository on GitHub (e.g. `auth-product-crud`).
3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/auth-product-crud.git
   git branch -M main
   git push -u origin main
   ```

*(The included `.gitignore` ensures that `.env` files and `node_modules/` are kept private and never committed).*

---

## 🌐 Deployment Preparation

### Frontend (Vercel)
1. Import repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Framework Preset: **Vite**.
4. Configure Environment Variable:
   - `VITE_API_URL` = `https://your-backend-api-url.onrender.com/api`
5. Deploy.

### Backend (Render or Railway)
1. Create a Web Service pointing to `backend`.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Configure Environment Variables:
   - `PORT` = `5000`
   - `ACCESS_TOKEN_SECRET` = `<generate-secure-random-key>`
   - `REFRESH_TOKEN_SECRET` = `<generate-secure-random-key>`
   - `FRONTEND_URL` = `https://your-frontend.vercel.app`
   - `NODE_ENV` = `production`
