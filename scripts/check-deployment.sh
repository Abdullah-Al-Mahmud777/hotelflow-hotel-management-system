#!/bin/bash

# HotelFlow Deployment Checker
# This script checks if everything is ready for deployment

echo "🔍 HotelFlow Deployment Checker"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 directory exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 directory missing"
        return 1
    fi
}

# Check Backend
echo "📦 Checking Backend (Server)..."
echo "--------------------------------"
check_file "server/package.json"
check_file "server/server.js"
check_file "server/vercel.json"
check_file "server/.env.example"
check_dir "server/node_modules" || echo -e "${YELLOW}⚠${NC}  Run 'npm install' in server directory"
echo ""

# Check Frontend
echo "🎨 Checking Frontend (Client)..."
echo "--------------------------------"
check_file "client/package.json"
check_file "client/next.config.ts"
check_file "client/.env.example"
check_file "client/lib/api.ts"
check_dir "client/node_modules" || echo -e "${YELLOW}⚠${NC}  Run 'npm install' in client directory"
echo ""

# Check Documentation
echo "📚 Checking Documentation..."
echo "--------------------------------"
check_file "README.md"
check_file "DEPLOYMENT.md"
check_file "QUICK_START.md"
check_file "VERCEL_CHECKLIST.md"
check_file "SETUP.md"
echo ""

# Check Git
echo "🔧 Checking Git..."
echo "--------------------------------"
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    
    # Check if .env files are in gitignore
    if grep -q ".env" .gitignore 2>/dev/null; then
        echo -e "${GREEN}✓${NC} .env files are in .gitignore"
    else
        echo -e "${RED}✗${NC} .env files not in .gitignore"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Git not initialized. Run 'git init'"
fi
echo ""

# Check Environment Files
echo "🔐 Checking Environment Files..."
echo "--------------------------------"
if [ -f "server/.env" ]; then
    echo -e "${YELLOW}⚠${NC}  server/.env exists (don't commit this!)"
else
    echo -e "${GREEN}✓${NC} server/.env not present (good for git)"
fi

if [ -f "client/.env.local" ]; then
    echo -e "${YELLOW}⚠${NC}  client/.env.local exists (don't commit this!)"
else
    echo -e "${GREEN}✓${NC} client/.env.local not present (good for git)"
fi
echo ""

# Final Summary
echo "================================"
echo "📋 Deployment Checklist:"
echo "================================"
echo ""
echo "Before deploying to Vercel:"
echo "1. ✓ Create MongoDB Atlas cluster"
echo "2. ✓ Get MongoDB connection string"
echo "3. ✓ Generate strong JWT secret"
echo "4. ✓ Push code to GitHub"
echo "5. ✓ Deploy backend to Vercel"
echo "6. ✓ Deploy frontend to Vercel"
echo "7. ✓ Add environment variables in Vercel"
echo "8. ✓ Update CORS settings"
echo "9. ✓ Test all endpoints"
echo ""
echo "📖 Read DEPLOYMENT.md for detailed instructions"
echo "⚡ Read QUICK_START.md for quick deployment"
echo ""
echo "🎉 Good luck with your deployment!"
