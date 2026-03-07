# Review Approval System

## ✅ New Feature: Admin Review Approval

Reviews now require admin approval before appearing publicly!

---

## 🎯 How It Works

### User Side:
1. User writes a review for an approved booking
2. Review is submitted with status: **pending**
3. User sees review in dashboard with "Waiting for admin approval" message
4. After admin approves, status changes to **approved**
5. Approved reviews appear publicly on room pages

### Admin Side:
1. Admin sees all reviews (pending, approved, rejected)
2. Can filter by status or rating
3. Can approve, reject, or delete reviews
4. Approved reviews show on public room pages
5. Rejected reviews don't appear publicly

---

## 📊 Review Statuses

### 🟡 Pending
- Default status when user submits review
- Not visible on public room pages
- Waiting for admin action
- User sees: "⏳ Waiting for admin approval"

### 🟢 Approved
- Admin has approved the review
- Visible on public room pages
- Counts toward room's average rating
- User sees: "✅ Approved by admin@hotelflow.com"

### 🔴 Rejected
- Admin has rejected the review
- Not visible on public room pages
- Doesn't count toward ratings
- User sees: "❌ This review was not approved"

---

## 🧪 Testing Guide

### Step 1: User Writes Review
```
1. Login as user
2. Go to dashboard
3. Find approved booking
4. Click "Write Review"
5. Rate and comment
6. Submit
7. See review with "pending" status in dashboard
```

### Step 2: Admin Reviews
```
1. Login as admin (admin@hotelflow.com / admin123)
2. Go to "Reviews" tab
3. See all reviews with status badges
4. Filter by "Pending" to see new reviews
5. Click "Approve" or "Reject"
```

### Step 3: User Sees Update
```
1. Go back to user dashboard
2. Refresh page
3. See review status updated
4. If approved: Green badge "approved"
5. If rejected: Red badge "rejected"
```

### Step 4: Public Display
```
1. Go to room page (as guest or user)
2. Only approved reviews are shown
3. Average rating calculated from approved reviews only
```

---

## 🎨 UI Changes

### User Dashboard - My Reviews Tab:
```
Review Card:
┌─────────────────────────────────────┐
│ Room Name          [pending badge]  │
│ ⭐⭐⭐⭐⭐                           │
│ Review comment text...              │
│ Date: Jan 1, 2025                   │
│ ⏳ Waiting for admin approval       │
└─────────────────────────────────────┘
```

### Admin Dashboard - Reviews Tab:
```
Filters:
[All] [Pending] [Approved] [Rejected] [5⭐] [4⭐] [3⭐] [2⭐] [1⭐]

Review Card:
┌─────────────────────────────────────┐
│ 👤 User Name  ⭐⭐⭐⭐⭐ [pending]  │
│ Room: Deluxe Suite                  │
│ Review comment text...              │
│ Date: Jan 1, 2025                   │
│                                     │
│ [Approve] [Reject] [Delete]         │
└─────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Database Changes:

**Review Model:**
```javascript
{
  room: ObjectId,
  user: ObjectId,
  booking: ObjectId,
  rating: Number (1-5),
  comment: String,
  status: String, // NEW: 'pending', 'approved', 'rejected'
  approvedBy: String, // NEW: admin email
  approvedAt: Date, // NEW: approval timestamp
  createdAt: Date
}
```

### API Endpoints:

**Admin Routes:**
```
PUT /api/admin/reviews/:id/status
Body: { status: 'approved' | 'rejected' }
Headers: Authorization: Bearer <admin_token>
```

**Public Routes:**
```
GET /api/reviews/room/:roomId
Returns: Only approved reviews
```

**User Routes:**
```
GET /api/reviews/my-reviews
Returns: All user's reviews (any status)
```

---

## 📈 Analytics Updates

Admin analytics now shows:
- Total Reviews
- Pending Reviews (new!)
- Approved Reviews (new!)
- Average Rating (from approved reviews only)

---

## 🎯 Features

### User Features:
✅ Write reviews for approved bookings
✅ See review status in dashboard
✅ Get feedback on approval/rejection
✅ Track all submitted reviews

### Admin Features:
✅ View all reviews (any status)
✅ Filter by status (pending, approved, rejected)
✅ Filter by rating (5⭐ to 1⭐)
✅ Approve reviews
✅ Reject reviews
✅ Delete reviews
✅ See who approved each review
✅ Track pending reviews count

### Public Features:
✅ Only approved reviews shown on room pages
✅ Average rating from approved reviews only
✅ Quality control for public content

---

## 🔐 Security

- Only authenticated users can write reviews
- Only admins can approve/reject reviews
- Users can only see their own reviews (all statuses)
- Public can only see approved reviews
- One review per booking (prevents spam)

---

## 📝 Workflow Diagram

```
User Writes Review
       ↓
Status: PENDING
       ↓
Admin Reviews
       ↓
    ┌──────┴──────┐
    ↓             ↓
APPROVE        REJECT
    ↓             ↓
Public         Hidden
Display        from
on Room        Public
Page
```

---

## 🎨 Status Badge Colors

```css
Pending:  Yellow (#FEF3C7 bg, #92400E text)
Approved: Green  (#D1FAE5 bg, #065F46 text)
Rejected: Red    (#FEE2E2 bg, #991B1B text)
```

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path
1. ✅ User writes review → Status: pending
2. ✅ Admin approves → Status: approved
3. ✅ Review appears on room page
4. ✅ User sees approved status

### Scenario 2: Rejection
1. ✅ User writes review → Status: pending
2. ✅ Admin rejects → Status: rejected
3. ✅ Review doesn't appear on room page
4. ✅ User sees rejected status

### Scenario 3: Multiple Reviews
1. ✅ User A writes review → pending
2. ✅ User B writes review → pending
3. ✅ Admin approves User A → approved
4. ✅ Admin rejects User B → rejected
5. ✅ Only User A's review shows publicly

---

## 📊 Admin Dashboard Stats

```
Analytics Card:
┌─────────────────────────┐
│ Total Reviews           │
│        15               │
│ 10 approved             │
│ 3 pending ⚠️            │
└─────────────────────────┘
```

---

## 🚀 Benefits

### For Users:
- Know when review is approved
- Understand review status
- Trust in quality control

### For Admins:
- Control public content
- Remove inappropriate reviews
- Maintain quality standards
- Track review metrics

### For Business:
- Quality assurance
- Brand protection
- Better customer trust
- Spam prevention

---

## ✅ Summary

The review approval system adds a quality control layer:

1. **Users** write reviews → pending status
2. **Admins** review and approve/reject
3. **Public** sees only approved reviews
4. **Everyone** benefits from quality control

All reviews are tracked, but only approved ones appear publicly! 🎉
