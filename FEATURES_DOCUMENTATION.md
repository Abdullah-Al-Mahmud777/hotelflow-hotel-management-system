# HotelFlow - Complete Features Documentation

## 🎯 5 Major Features Implemented

### 1. **User Authentication System** ✅
Complete JWT-based authentication with secure password hashing.

**Backend:**
- User Model with bcrypt password hashing
- JWT token generation (30-day expiry)
- Auth middleware for protected routes
- Role-based access control (user/admin)

**Frontend:**
- Login page with form validation
- Register page with password confirmation
- Auto-redirect to dashboard after login
- Token stored in localStorage

**API Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

**Test Credentials:**
- Register a new account or use existing credentials

---

### 2. **User Dashboard** ✅
Personalized dashboard for logged-in users.

**Features:**
- Welcome message with user name
- Statistics cards (Total Bookings, Approved, Reviews)
- Tabbed interface (My Bookings, My Reviews)
- Booking history with status badges
- Quick access to write reviews
- Edit profile button
- Logout functionality

**Pages:**
- `/user/dashboard` - Main dashboard
- Mobile responsive design
- Real-time data from backend

---

### 3. **Booking History & Management** ✅
Complete booking tracking system for users.

**Features:**
- View all personal bookings
- Filter by status (pending, approved, rejected, cancelled)
- See booking details (dates, guests, price)
- Status badges with color coding
- Link to write review for approved bookings
- Booking linked to user account

**Backend Updates:**
- Booking model now includes `user` reference
- Filter bookings by user email
- Populate room details in bookings

---

### 4. **Profile Management** ✅
Users can update their personal information.

**Features:**
- Edit name, phone number
- Upload avatar (URL-based)
- Avatar preview before saving
- Success/error notifications
- Auto-redirect to dashboard after update
- Data persists in localStorage and database

**API:**
- `PUT /api/auth/profile` - Update user profile
- Protected route (requires JWT token)

**Page:**
- `/user/profile` - Profile edit page

---

### 5. **Reviews & Ratings System** ⭐
Complete review system for approved bookings.

**Features:**
- 5-star rating system
- Write detailed reviews
- Only approved bookings can be reviewed
- One review per booking (prevents duplicates)
- View all personal reviews in dashboard
- Reviews linked to rooms and users

**Backend:**
- Review Model with room, user, booking references
- Unique constraint on booking (no duplicate reviews)
- Calculate average rating for rooms
- Protected routes

**API Endpoints:**
- `POST /api/reviews` - Create review (protected)
- `GET /api/reviews/room/:roomId` - Get room reviews (public)
- `GET /api/reviews/my-reviews` - Get user reviews (protected)
- `DELETE /api/reviews/:id` - Delete review (protected)

**Pages:**
- `/user/review/[bookingId]` - Write review page
- Interactive star rating selector
- Comment textarea

---

## 🔐 Authentication Flow

### Registration:
1. User fills registration form
2. Backend validates and hashes password
3. JWT token generated
4. User data + token stored in localStorage
5. Redirect to `/user/dashboard`

### Login:
1. User enters email/password
2. Backend verifies credentials
3. JWT token generated
4. User data + token stored in localStorage
5. Redirect to `/user/dashboard`

### Protected Routes:
- All `/user/*` routes check for token
- Backend validates JWT on protected API calls
- Auto-redirect to `/login` if not authenticated

---

## 📱 User Interface Features

### Navbar Updates:
- Shows user name when logged in
- Dashboard link for authenticated users
- Logout button
- Login/Register buttons for guests
- Mobile responsive

### Dashboard Features:
- Clean, modern design
- Statistics overview
- Tabbed navigation
- Status badges with colors:
  - 🟡 Pending (yellow)
  - 🟢 Approved (green)
  - 🔴 Rejected (red)
  - ⚫ Cancelled (gray)

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

### Updated Booking Model:
```javascript
{
  user: ObjectId (ref: User), // NEW
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

---

## 🚀 How to Use

### For Users:
1. **Register**: Go to `/register` and create account
2. **Login**: Go to `/login` with credentials
3. **Browse Rooms**: Visit `/rooms` to see available rooms
4. **Book Room**: Click on room → Fill booking form
5. **View Dashboard**: Go to `/user/dashboard` to see bookings
6. **Write Review**: After booking approved, click "Write Review"
7. **Edit Profile**: Click "Edit Profile" in dashboard
8. **Logout**: Click logout button in navbar

### For Admins:
1. **Login**: Go to `/admin/login` (admin@hotelflow.com / admin123)
2. **Manage Rooms**: Add/Edit/Delete rooms with images
3. **Manage Bookings**: Approve/Reject user bookings
4. **View Analytics**: See booking statistics

---

## 🔧 Technical Stack

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled for Vercel

### Frontend:
- Next.js 14 (App Router)
- React Hooks (useState, useEffect)
- Tailwind CSS
- Client-side routing
- localStorage for token management

---

## 📦 New Dependencies Added

### Server:
```bash
npm install bcryptjs
```

Already had: `jsonwebtoken`, `mongoose`, `express`, `cors`

---

## 🎨 Design Features

- Clean, modern UI
- Blue color theme
- Responsive design (mobile, tablet, desktop)
- Loading states
- Success/Error notifications
- Smooth transitions
- Emoji icons for visual appeal

---

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with expiry
- Protected API routes
- Role-based access control
- Input validation
- Unique email constraint
- Prevent duplicate reviews

---

## 📝 Notes

- All user features require authentication
- Reviews can only be written for approved bookings
- One review per booking maximum
- Profile updates persist across sessions
- Mobile-first responsive design
- All API calls use centralized `getApiUrl()` helper

---

## 🎯 Future Enhancements (Optional)

- Password reset functionality
- Email verification
- Social login (Google, Facebook)
- Real-time notifications
- Booking cancellation by users
- Review editing
- Image upload for avatars
- Payment integration
- Booking calendar view
- Advanced search filters

---

## ✅ Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] View dashboard
- [ ] Check booking history
- [ ] Update profile
- [ ] Write review for approved booking
- [ ] View reviews in dashboard
- [ ] Logout and login again
- [ ] Test on mobile device
- [ ] Test all API endpoints
