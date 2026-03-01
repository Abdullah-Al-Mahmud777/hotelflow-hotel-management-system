# 🏨 HotelFlow - Hotel Management System

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**HotelFlow** is a robust, full-stack web application designed to streamline hotel operations. It allows administrators to manage room inventories efficiently while providing users with a seamless experience to browse and book accommodations.

---

## 🚀 Quick Links

- 🎯 **[START HERE](./START_HERE.md)** - শুরু করার জন্য এখানে click করুন
- 📚 **[Documentation Index](./INDEX.md)** - সব documentation এক জায়গায়
- ⚡ **[Quick Deploy Guide](./QUICK_START.md)** - 15 মিনিটে deploy করুন
- 📖 **[Complete Deployment Guide](./DEPLOYMENT.md)** - বিস্তারিত guide (Bangla)
- ✅ **[Deployment Checklist](./VERCEL_CHECKLIST.md)** - Step by step checklist
- 🛠️ **[Local Setup Guide](./SETUP.md)** - Development setup
- 🏗️ **[Architecture](./ARCHITECTURE.md)** - System architecture

---

## 🛠️ Tech Stack

### **Frontend (Client Side)**
* **Framework:** **Next.js** (App Router)
* **Styling:** Tailwind CSS (Responsive & Modern UI)
* **Key Features:** Server-Side Rendering (SSR), Optimized Image Loading, and Dynamic Routing for room details.

### **Backend (Server Side)**
* **Environment:** **Node.js**
* **Framework:** **Express.js**
* **Key Features:** Efficient RESTful API development, custom middleware for data validation, and secure endpoints.

### **Database (Data Storage)**
* **Database:** **MongoDB** (NoSQL)
* **ODM:** **Mongoose**
* **Key Features:** Schema-based validation and high-speed data retrieval for room pricing and availability.

---

## ✨ Features

### 👤 1. User (Guest) Side
- [x] **Room Browsing & Filtering:** Search rooms by type, price range, and availability.
- [x] **Detailed Room View:** High-quality images, descriptions, and amenities.
- [x] **Booking System:** Seamless date-based booking interface.
- [x] **Booking History:** Tracking of past and upcoming stays.
- [x] **Review & Rating:** User feedback system for service improvement.

### 🛡️ 2. Admin Dashboard
- [x] **Statistic Overview:** Business growth visualization using interactive **Charts**.
- [x] **Room Management (CRUD):** Full control over creating, updating, and deleting rooms.
- [x] **Booking Management:** Real-time management of guest reservations.
- [x] **User Management:** Monitoring guest profiles and roles.
- [x] **Global Search:** Instant search for rooms, users, or booking IDs.

---

## 🚀 How to Run the Project

Follow these steps to set up the project on your local machine.

### **1. Prerequisites**
* Install [Node.js](https://nodejs.org/) (Latest Version)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or Local MongoDB.
`
### **2. Backend Setup**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create a .env file and add your credentials
cp .env.example .env
# Edit .env file with your MongoDB URI and JWT secret

# Start the server (Development mode)
npm run dev
```

### **3. Frontend Setup**

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Start the development server
npm run dev
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

আপনার frontend এবং backend Vercel এ deploy করতে:

📖 **বিস্তারিত গাইড:** [DEPLOYMENT.md](./DEPLOYMENT.md) (Bangla)

⚡ **Quick Start:** [QUICK_START.md](./QUICK_START.md) - 15 মিনিটে deploy করুন

✅ **Checklist:** [VERCEL_CHECKLIST.md](./VERCEL_CHECKLIST.md) - Step by step checklist

### Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd server
vercel

# Deploy frontend
cd client
vercel
```

---

## 📁 Project Files

- `server/vercel.json` - Backend Vercel configuration
- `client/lib/api.ts` - Frontend API utility
- `.env.example` - Environment variable templates
- `DEPLOYMENT.md` - Complete deployment guide (Bangla)
- `SETUP.md` - Local development setup guide

