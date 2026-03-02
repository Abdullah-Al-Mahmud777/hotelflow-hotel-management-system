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
JWT_SECRET=your_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📝 License

MIT License

---

**Built with ❤️ using Next.js, Express.js, and MongoDB**
