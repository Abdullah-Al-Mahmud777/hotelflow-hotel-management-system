# HotelFlow - Complete System Guide

## 🎉 System Overview

A full-stack hotel management system with user and admin features, built with Next.js, Node.js, Express, and MongoDB.

---

## 👥 USER SIDE FEATURES (5 Features)

### 1. **User Authentication System** ✅
- Register with name, email, phone, password
- Login with JWT token (30-day expiry)
- Secure password hashing with bcrypt
- Auto-redirect to dashboard after login
- Token-based session management

**Pages:**
- `/register` - User registration
- `/login` - User login
- `/user/dashboard` - User dashboard

### 2. **User Dashboard** ✅
- Personalized welcome message
- Statistics cards (Total Bookings, Approved, Reviews)
- Tabbed interface (My Bookings, My Reviews)
- View all personal bookings with status
- Quick access to write reviews
- Edit profile button
- Logout functionality

**Features:**
- Real-time data from backend
- Color-coded status badges
- Mobile responsive design
- Clean, modern UI

### 3. **Booking History & Management** ✅
- View all personal bookings
- Filter by status (pending, approved, rejected, cancelled)
- See booking details (dates, guests, price, room)
- Status tracking with visual badges
- Link to write review for approved bookings
- Bookings linked to user account

### 4. **Profile Management** ✅
- Edit name and phone number
- Upload avatar (URL-based)
- Live avatar preview
- Success/error notifications
- Data persists in database and localStorage
- Auto-redirect after update

**Page:**
- `/user/profile` - Edit profile

### 5. **Reviews & Ratings System** ⭐
- 5-star rating with interactive selector
- Write detailed review comments
- Only for approved bookings
- One review per booking (prevents duplicates)
- View all personal reviews in dashboard
- Reviews linked to rooms, users, and bookings

**Page:**
- `/user/review/[bookingId]` - Write review

---

## 🔧 ADMIN SIDE FEATURES (5 Features)

### 1. **Analytics Dashboard** 📊
- Real-time statistics overview
- Visual stat cards with gradients:
  - Total Users (with active count)
  - Total Bookings (with approved count)
  - Total Rooms
  - Total Reviews (with average rating)
- Booking status breakdown
- Total revenue calculation
- Recent activity feed
- Time-ago formatting

**API:** `GET /api/admin/analytics`

### 2. **User Management** 👥
- View all registered users
- Search users by name or email
- Filter: All, Active, Inactive
- User details: avatar, name, email, phone, role, join date, status
- Actions:
  - Activate/Deactivate users
  - Delete users (cannot delete admins)
- Mobile responsive table
- Color-coded badges

**API:**
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/status`
- `DELETE /api/admin/users/:id`

### 3. **Review Management** ⭐
- View all reviews from all users
- Filter by rating (5⭐ to 1⭐)
- Review details: user, rating, room, comment, date
- Delete inappropriate reviews
- Beautiful card layout
- Mobile responsive

**API:**
- `GET /api/admin/reviews`
- `DELETE /api/reviews/:id`

### 4. **Enhanced Booking Management** 📅
- View all bookings
- Filter by status (All, Pending, Approved)
- Approve/Reject bookings
- Delete bookings
- View guest and room details
- See dates and prices
- Mobile responsive

### 5. **Room Management** 🏨
- Add new rooms
- Edit existing rooms
- Delete rooms
- Upload room images (URL-based)
- Set featured status
- Manage details (name, type, price, capacity, description)
- Mobile responsive

---

## 🔐 Authentication & Security

### User Authentication:
- JWT tokens with 30-day expiry
- Password hashing with bcrypt (12 rounds)
- Protected routes with middleware
- Role-based access control
- Token stored in localStorage

### Admin Authentication:
- Same JWT system
- Role verification (must be admin)
- Cannot delete admin users
- All admin routes protected

### Admin Credentials:
```
Email: admin@hotelflow.com
Password: admin123
```

---

## 🗄️ Database Models

### User Model:
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (user/admin),
  avatar: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Booking Model:
```javascript
{
  user: ObjectId (ref: User),
  room: ObjectId (ref: Room),
  checkIn: Date,
  checkOut: Date,
  guestName: String,
  guestEmail: String,
  guestPhone: String,
  totalPrice: Number,
  numberOfGuests: Number,
  specialRequests: String,
  status: String (pending/approved/rejected/cancelled),
  approvedBy: String,
  approvedAt: Date
}
```

### Review Model:
```javascript
{
  room: ObjectId (ref: Room),
  user: ObjectId (ref: User),
  booking: ObjectId (ref: Booking, unique),
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

### Room Model:
```javascript
{
  name: String,
  type: String (Standard/Deluxe/Suite),
  price: Number,
  description: String,
  capacity: Number,
  image: String,
  featured: Boolean
}
```

---

## 🚀 API Endpoints

### Auth Routes:
```
POST   /api/auth/register          - Register user
POST   /api/auth/login             - Login user/admin
GET    /api/auth/me                - Get current user (protected)
PUT    /api/auth/profile           - Update profile (protected)
```

### User Routes (Protected):
```
GET    /api/reviews/my-reviews     - Get user's reviews
POST   /api/reviews                - Create review
DELETE /api/reviews/:id            - Delete own review
```

### Admin Routes (Protected - Admin Only):
```
GET    /api/admin/users            - Get all users
PUT    /api/admin/users/:id/status - Update user status
DELETE /api/admin/users/:id        - Delete user
GET    /api/admin/reviews          - Get all reviews
GET    /api/admin/analytics        - Get analytics
```

### Room Routes:
```
GET    /api/rooms                  - Get all rooms
GET    /api/rooms/featured         - Get featured rooms
GET    /api/rooms/:id              - Get single room
POST   /api/rooms                  - Create room (admin)
PUT    /api/rooms/:id              - Update room (admin)
DELETE /api/rooms/:id              - Delete room (admin)
```

### Booking Routes:
```
GET    /api/bookings               - Get all bookings
POST   /api/bookings               - Create booking
PUT    /api/bookings/:id/status    - Update booking status (admin)
DELETE /api/bookings/:id           - Delete booking (admin)
```

### Review Routes:
```
GET    /api/reviews/room/:roomId   - Get room reviews (public)
```

---

## 📱 Pages Structure

### Public Pages:
- `/` - Home page with featured rooms
- `/rooms` - All rooms with filters
- `/rooms/[id]` - Room details with booking form
- `/about` - About page
- `/login` - User login
- `/register` - User registration

### User Pages (Protected):
- `/user/dashboard` - User dashboard
- `/user/profile` - Edit profile
- `/user/review/[bookingId]` - Write review

### Admin Pages (Protected - Admin Only):
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard with tabs:
  - Analytics
  - Room Management
  - Bookings
  - User Management
  - Reviews

---

## 🎨 Design Features

### Color Theme:
- Primary: Blue (#2563eb)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)
- Purple: (#8b5cf6)

### UI Components:
- Gradient stat cards
- Color-coded status badges
- Interactive star ratings
- Avatar displays
- Responsive tables
- Modal forms
- Search and filters
- Loading states
- Success/error notifications

### Responsive Design:
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px
- Hamburger menu on mobile
- Stacked layouts
- Hidden columns on small screens
- Touch-optimized buttons

---

## 🛠️ Setup & Installation

### 1. Install Dependencies:
```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 2. Environment Variables:

**Server (.env):**
```
MONGO_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Client (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Seed Database:
```bash
cd server
npm run seed:admin    # Create admin user
npm run seed          # Create sample rooms (optional)
```

### 4. Run Development:
```bash
# Server (Terminal 1)
cd server
npm run dev

# Client (Terminal 2)
cd client
npm run dev
```

### 5. Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Admin: http://localhost:3000/admin/login

---

## 🧪 Testing Guide

### User Flow:
1. Register at `/register`
2. Login at `/login`
3. Browse rooms at `/rooms`
4. Book a room
5. View booking in dashboard
6. Wait for admin approval
7. Write review after approval
8. Edit profile
9. Logout

### Admin Flow:
1. Login at `/admin/login` (admin@hotelflow.com / admin123)
2. View analytics dashboard
3. Manage users (activate/deactivate)
4. Approve/reject bookings
5. Manage reviews
6. Add/edit/delete rooms
7. Monitor system activity

---

## 📊 Statistics & Metrics

### Admin Can Track:
- Total users and active users
- Total bookings by status
- Total revenue from approved bookings
- Average rating across all reviews
- Recent system activity
- User growth
- Booking trends

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected routes with middleware
- ✅ Role-based access control
- ✅ Input validation
- ✅ Unique email constraint
- ✅ Prevent duplicate reviews
- ✅ Cannot delete admin users
- ✅ CORS configuration
- ✅ Token expiry

---

## 🚀 Deployment

### Backend (Vercel):
1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

### Frontend (Vercel):
1. Push to GitHub
2. Import to Vercel
3. Set `NEXT_PUBLIC_API_URL` to backend URL
4. Deploy

### Environment Variables (Production):
- Set all .env variables in Vercel dashboard
- Update `NEXT_PUBLIC_API_URL` to production backend URL
- Set `NODE_ENV=production`

---

## 📦 Dependencies

### Server:
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - CORS middleware
- dotenv - Environment variables
- multer - File uploads
- cloudinary - Image hosting

### Client:
- next - React framework
- react - UI library
- tailwindcss - CSS framework

---

## ✅ Feature Checklist

### User Features:
- [x] User registration
- [x] User login
- [x] User dashboard
- [x] Booking history
- [x] Profile management
- [x] Write reviews
- [x] View own reviews
- [x] Logout

### Admin Features:
- [x] Admin login
- [x] Analytics dashboard
- [x] User management
- [x] Review management
- [x] Booking management
- [x] Room management
- [x] Revenue tracking
- [x] Activity monitoring

### System Features:
- [x] JWT authentication
- [x] Role-based access
- [x] Mobile responsive
- [x] Search & filters
- [x] Status tracking
- [x] Image uploads (URL)
- [x] Real-time data
- [x] Error handling

---

## 🎯 Key Achievements

1. ✅ Complete user authentication system
2. ✅ Full-featured user dashboard
3. ✅ Comprehensive admin dashboard
4. ✅ Review and rating system
5. ✅ User and booking management
6. ✅ Analytics and reporting
7. ✅ Mobile responsive design
8. ✅ Secure JWT authentication
9. ✅ Role-based access control
10. ✅ Real-time data updates

---

## 💡 Future Enhancements

- Email notifications
- Password reset
- Social login
- Payment integration
- Booking calendar
- Advanced analytics with charts
- Export data to CSV
- Real-time chat support
- Multi-language support
- Dark mode

---

## 📞 Support

For issues or questions:
- Check documentation files
- Review API endpoints
- Test with provided credentials
- Verify environment variables

---

## 🎉 Summary

**Total Features: 10** (5 User + 5 Admin)

**User Side:**
1. Authentication System
2. User Dashboard
3. Booking History
4. Profile Management
5. Reviews & Ratings

**Admin Side:**
1. Analytics Dashboard
2. User Management
3. Review Management
4. Booking Management
5. Room Management

**System is:**
- ✅ Fully functional
- ✅ Secure with JWT
- ✅ Mobile responsive
- ✅ Production ready
- ✅ Well documented

**Admin can manage everything users can do, plus:**
- Monitor system analytics
- Control user access
- Moderate reviews
- Track revenue
- View activity logs

The system is complete and ready for deployment! 🚀
