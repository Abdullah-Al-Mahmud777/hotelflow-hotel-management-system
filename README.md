# 🏨 HotelFlow - Hotel Management System

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**HotelFlow** is a robust, full-stack web application designed to streamline hotel operations.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 16 (App Router)
* **Styling:** Tailwind CSS 4
* **Language:** javascript
* **Deployment:** Vercel

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js 5
* **Language:** JavaScript
* **Deployment:** Vercel Serverless

### Database
* **Database:** MongoDB Atlas (Cloud)
* **ODM:** Mongoose 9

---

## 🚀 Vercel Deployment

### Prerequisites
1. [Vercel Account](https://vercel.com)
2. [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)
3. GitHub repository

### Step 1: MongoDB Atlas
1. Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create database user
3. Whitelist IP: `0.0.0.0/0`
4. Get connection string

### Step 2: Deploy Backend
1. [Vercel Dashboard](https://vercel.com/dashboard) → Add New Project
2. Import GitHub repository
3. **Root Directory:** `server`
4. **Framework:** Other
5. **Environment Variables:**

6. Deploy → Copy backend URL

### Step 3: Deploy Frontend
1. [Vercel Dashboard](https://vercel.com/dashboard) → Add New Project
2. Import same repository
3. **Root Directory:** `client`
4. **Framework:** Next.js (auto-detected)
5. **Environment Variables:**


6. Deploy → Copy frontend URL

### Step 4: Update CORS
Backend project → Settings → Environment Variables:

Redeploy backend

---

## 💻 Local Development

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 📁 Project Structure

```
hotelflow/
├── client/          # Next.js Frontend
│   ├── app/        # App router pages
│   ├── lib/        # API utilities
│   └── package.json
│
├── server/          # Express Backend
│   ├── server.js   # Main server file
│   ├── vercel.json # Vercel config
│   └── package.json
│
└── README.md
```

---

## 🔧 Configuration Files

- `server/vercel.json` - Backend Vercel configuration
- `client/next.config.ts` - Next.js configuration
- `client/lib/api.ts` - API client utility
- `.env.example` - Environment templates
- `.vercelignore` - Vercel ignore rules

---

## 🌐 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://...
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:3000
CLIENT_URLS=http://localhost:3000
ALLOW_VERCEL_PREVIEWS=false

# Demo accounts (auto-created; passwords are bcrypt-hashed in MongoDB)
DEMO_LOGIN_ENABLED=true
DEMO_ADMIN_EMAIL=admin@hotelflow.com
DEMO_ADMIN_PASSWORD=admin123
DEMO_USER_EMAIL=user@hotelflow.com
DEMO_USER_PASSWORD=user123
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🔐 Authentication & Demo Accounts

- **Separate portals:** `/login` has User/Admin tabs; `/admin/login` is the dedicated admin entry.
- **Default demo accounts** (created automatically on first backend start):
  - Admin — `admin@hotelflow.com` / `admin123`
  - User — `user@hotelflow.com` / `user123`
- Passwords are hashed with bcrypt (cost 12) before storage. The login page
  fetches demo credentials from `GET /api/auth/demo-credentials` instead of
  hardcoding them in the client bundle.
- **Role-based access:** admin APIs require a valid JWT with `role: admin`;
  user dashboard APIs are scoped to the authenticated user. Public registration
  can only create regular users. Inventory writes and image uploads are admin-only.
- **Sessions:** JWT bearer token (30 days, configurable) plus an httpOnly,
  `SameSite=None` cookie in production (cleared on logout).
- **Production safety:** set a strong `JWT_SECRET`, change the demo passwords
  (or set `DEMO_LOGIN_ENABLED=false` after testing), and set `FRONTEND_URL`
  to your deployed frontend domain.

### Deploying authentication changes

1. **Backend (Vercel → `server/`)**
   - Add `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, and the `DEMO_*` variables
     from `server/.env.production.example`.
   - Redeploy. The first request connects to Atlas and idempotently creates the
     demo accounts (hashed); subsequent cold starts reuse the cached connection.
2. **Frontend (Vercel → `client/`)**
   - Set `NEXT_PUBLIC_API_URL` to the backend deployment URL.
   - Redeploy after changing environment variables (Next.js inlines public env
     vars at build time).
3. **Verify live:**
   - Open `/login` and confirm both demo credential cards are visible.
   - Log in as the user → lands on `/user/dashboard`.
   - Log in as the admin → lands on `/admin`; `/api/admin/users` returns 200.
   - Log out, then confirm a protected page redirects to `/login`.
   - Try an invalid password (401) and a user token on an admin endpoint (403).

> Tip: Vercel preview URLs are blocked by default. Set
> `ALLOW_VERCEL_PREVIEWS=true` only if you need every `*.vercel.app` preview
> origin to access the API; otherwise list exact origins in `CLIENT_URLS`.

---
### feature 
### 1.User Module (The Guest Journey)
Smart Search: Filter by date, price, and room type (Deluxe/Suite).

Live Booking: Interactive calendar to see available dates instantly.

Guest Dashboard: Manage active bookings and view past stay history.

Secure Payment: Fast checkout using Stripe or SSLCommerz.

Auto-Receipts: Instant PDF invoice generation after payment.

Post-Stay Reviews: Verified rating system for completed stays.

### 2. Admin Module (The Command Center)
Analytics Dashboard: Visual charts for daily revenue and occupancy rates.

Room Control (CRUD): Add/edit rooms, set prices, and toggle "Maintenance" mode.

Booking Manager: View, confirm, or cancel guest reservations.

Role-Based Access: Separate logins for Admins, Receptionists, and Cleaners.

One-Click Desk: Fast "Check-in/Check-out" buttons for front-desk staff.

Inventory Alerts: Low-stock notifications for hotel supplies.

## 📝 License

MIT License

---

**Built with ❤️ using Next.js, Express.js, and MongoDB**
