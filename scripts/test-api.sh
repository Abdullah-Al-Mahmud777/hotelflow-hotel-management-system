#!/bin/bash

# API Testing Script
# Usage: ./scripts/test-api.sh <backend-url>

if [ -z "$1" ]; then
    echo "Usage: ./scripts/test-api.sh <backend-url>"
    echo "Example: ./scripts/test-api.sh https://your-backend.vercel.app"
    exit 1
fi

BACKEND_URL=$1
API_URL="${BACKEND_URL}/api"

echo "🧪 Testing HotelFlow API"
echo "========================="
echo "Backend URL: $BACKEND_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test function
test_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✓ OK${NC} (Status: $response)"
    else
        echo -e "${RED}✗ FAILED${NC} (Status: $response)"
    fi
}

# Test Base URL
echo "1. Testing Base URL"
test_endpoint "$BACKEND_URL" "Base URL"
echo ""

# Test API Endpoints
echo "2. Testing API Endpoints"
test_endpoint "${API_URL}/rooms" "Rooms API"
test_endpoint "${API_URL}/book" "Bookings API"
test_endpoint "${API_URL}/roomviews" "Room Views API"
echo ""

# Test with curl verbose
echo "3. Detailed Response (Rooms API)"
echo "================================"
curl -s "${API_URL}/rooms" | head -n 20
echo ""
echo "================================"
echo ""

echo "✅ API Testing Complete!"
echo ""
echo "If you see errors:"
echo "- Check if backend is deployed"
echo "- Verify MongoDB connection"
echo "- Check Vercel logs"
