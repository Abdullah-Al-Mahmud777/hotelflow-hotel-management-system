# Vercel Deployment Guide

## Fixed Issues
1. ✅ Removed deprecated `builds` from vercel.json
2. ✅ Fixed CORS to allow all Vercel preview URLs
3. ✅ Fixed double slash in API URLs (//api/rooms → /api/rooms)
4. ✅ Created centralized API URL helper to prevent URL issues

## Environment Variables Setup

### Backend (Server) - Vercel Project Settings
```
MONGO_URI=mongodb+srv://shuvo:hello%40100@cluster0.bfd2hb1.mongodb.net/hotelflow_db?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
JWT_SECRET=your_super_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Frontend (Client) - Vercel Project Settings
```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

**IMPORTANT**: 
- Do NOT add trailing slash to `NEXT_PUBLIC_API_URL`
- Example: ✅ `https://hotelflow-hotel-management-system.vercel.app`
- Example: ❌ `https://hotelflow-hotel-management-system.vercel.app/`

## Deployment Steps

### 1. Deploy Backend First
```bash
cd server
vercel --prod
```
Copy the production URL (e.g., `https://hotelflow-hotel-management-system.vercel.app`)

### 2. Deploy Frontend
```bash
cd client
vercel --prod
```

### 3. Set Environment Variables
In Vercel Dashboard:
- Go to your frontend project → Settings → Environment Variables
- Add `NEXT_PUBLIC_API_URL` with your backend URL (no trailing slash)
- Redeploy frontend

## Testing
1. Visit your frontend URL
2. Check browser console for errors
3. Test admin login: admin@hotelflow.com / admin123
4. Test room creation with image URL
5. Test booking system

## Common Issues

### CORS Error
- Make sure backend is deployed and running
- Check that frontend URL is allowed in CORS (all .vercel.app domains are allowed)

### Double Slash Error (//api/rooms)
- Fixed by using `getApiUrl()` helper function
- Make sure `NEXT_PUBLIC_API_URL` has no trailing slash

### 404 Errors
- Check that backend routes are working: visit `https://your-backend.vercel.app/health`
- Verify environment variables are set correctly

## Files Changed
- `server/server.js` - Updated CORS configuration
- `server/vercel.json` - Removed deprecated builds
- `client/lib/api.js` - Added URL helper to prevent double slashes
- `client/lib/apiUrl.js` - New helper for API URL building
- `client/app/admin/components/RoomManagement.js` - Using getApiUrl()
- `client/app/admin/components/BookingManagement.js` - Using getApiUrl()
- `client/app/rooms/[id]/page.js` - Using getApiUrl()
