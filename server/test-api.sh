#!/bin/bash

# HotelFlow API Testing Script
# Make sure server is running before executing this script

BASE_URL="http://localhost:5000"

echo "🧪 Testing HotelFlow API"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Base URL
echo "1️⃣  Testing Base URL..."
response=$(curl -s "$BASE_URL")
if echo "$response" | grep -q "HotelFlow API is running"; then
    echo -e "${GREEN}✓ Base URL working${NC}"
else
    echo -e "${RED}✗ Base URL failed${NC}"
fi
echo ""

# Test 2: Get All Rooms (should be empty initially)
echo "2️⃣  Testing GET /api/rooms..."
response=$(curl -s "$BASE_URL/api/rooms")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ GET /api/rooms working${NC}"
    echo "Response: $response" | head -c 100
    echo "..."
else
    echo -e "${RED}✗ GET /api/rooms failed${NC}"
fi
echo ""

# Test 3: Create a Room
echo "3️⃣  Testing POST /api/rooms..."
room_data='{
  "name": "Test Deluxe Room",
  "type": "Deluxe",
  "price": 5000,
  "capacity": 2,
  "description": "Test room for API testing",
  "amenities": ["WiFi", "TV", "AC"],
  "roomNumber": "TEST-501",
  "floor": 5
}'

response=$(curl -s -X POST "$BASE_URL/api/rooms" \
  -H "Content-Type: application/json" \
  -d "$room_data")

if echo "$response" | grep -q "Room created successfully"; then
    echo -e "${GREEN}✓ POST /api/rooms working${NC}"
    room_id=$(echo "$response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Created Room ID: $room_id"
else
    echo -e "${RED}✗ POST /api/rooms failed${NC}"
    echo "Response: $response"
fi
echo ""

# Test 4: Get Single Room
if [ ! -z "$room_id" ]; then
    echo "4️⃣  Testing GET /api/rooms/:id..."
    response=$(curl -s "$BASE_URL/api/rooms/$room_id")
    if echo "$response" | grep -q "Test Deluxe Room"; then
        echo -e "${GREEN}✓ GET /api/rooms/:id working${NC}"
    else
        echo -e "${RED}✗ GET /api/rooms/:id failed${NC}"
    fi
    echo ""
fi

# Test 5: Get All Bookings
echo "5️⃣  Testing GET /api/bookings..."
response=$(curl -s "$BASE_URL/api/bookings")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ GET /api/bookings working${NC}"
else
    echo -e "${RED}✗ GET /api/bookings failed${NC}"
fi
echo ""

# Test 6: Create a Booking
if [ ! -z "$room_id" ]; then
    echo "6️⃣  Testing POST /api/bookings..."
    booking_data="{
      \"room\": \"$room_id\",
      \"guestName\": \"Test Guest\",
      \"guestEmail\": \"test@example.com\",
      \"guestPhone\": \"+8801712345678\",
      \"checkIn\": \"2024-03-15\",
      \"checkOut\": \"2024-03-20\",
      \"numberOfGuests\": 2,
      \"totalPrice\": 25000
    }"
    
    response=$(curl -s -X POST "$BASE_URL/api/bookings" \
      -H "Content-Type: application/json" \
      -d "$booking_data")
    
    if echo "$response" | grep -q "Booking created successfully"; then
        echo -e "${GREEN}✓ POST /api/bookings working${NC}"
        booking_id=$(echo "$response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "Created Booking ID: $booking_id"
    else
        echo -e "${RED}✗ POST /api/bookings failed${NC}"
        echo "Response: $response"
    fi
    echo ""
fi

# Summary
echo "========================"
echo "✅ API Testing Complete!"
echo ""
echo "📝 Notes:"
echo "- Test data has been created in your database"
echo "- You can view it in MongoDB Atlas"
echo "- Use Postman for more detailed testing"
echo ""
echo "🧹 Cleanup:"
echo "- Delete test room: DELETE $BASE_URL/api/rooms/$room_id"
echo "- Delete test booking: DELETE $BASE_URL/api/bookings/$booking_id"
