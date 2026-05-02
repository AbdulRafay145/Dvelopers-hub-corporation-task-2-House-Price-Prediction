#!/bin/bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ⚛  HousePrice AI — Frontend Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/frontend"

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install Node.js 18+"
  exit 1
fi

echo "📦 Installing npm dependencies..."
npm install

echo "🚀 Starting React app on http://localhost:3000"
echo "   Make sure backend is running on port 5000 first!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm start
