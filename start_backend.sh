#!/bin/bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🏠 HousePrice AI — Backend Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/backend"

# Check Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python3 not found. Install Python 3.10+"
  exit 1
fi

echo "📦 Installing dependencies..."
pip install -r requirements.txt -q

echo "🚀 Starting Flask backend on http://localhost:5000"
echo "   Models will train automatically in background."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 app.py
