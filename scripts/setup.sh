#!/bin/bash

# FundFlow AI Setup Script
# This script helps you set up Firebase and deploy to Vercel

set -e

echo "🚀 FundFlow AI Setup"
echo "=================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and fill in your Firebase and Gemini API keys"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed"
    echo ""
fi

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login
firebase use --add

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Firebase config and Gemini API key"
echo "2. Run: firebase deploy --only firestore:rules,firestore:indexes,storage"
echo "3. Run: npm run dev (to test locally)"
echo "4. Deploy to Vercel: vercel (or via Vercel dashboard)"
echo ""
