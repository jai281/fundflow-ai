# FundFlow AI - AI-Powered Fundraising Automation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange?logo=firebase)](https://firebase.google.com/)

**FundFlow AI** is a production-ready fundraising automation platform that helps startup founders:

- 📊 **Analyze pitch decks** with AI-powered Investment Readiness Scores
- 🎯 **Match with investors** based on stage, sector, and geography
- 📧 **Automate outreach** with personalized email templates

Built with **Next.js 14**, **Firebase (Auth + Firestore + Storage)**, **Tailwind CSS**, and deployed on **Vercel**.

## ✨ Features

### Core Features
- **User Authentication** - Email/password sign up and login via Firebase Auth
- **Pitch Deck Analysis** - Upload PDF/PPTX decks, get AI-powered scores and feedback
- **Investor Matching** - Algorithm matches founders with 10,000+ investors
- **Outreach Automation** - Generate personalized email templates
- **Dashboard** - Track decks, matches, and outreach campaigns
- **Responsive UI** - Mobile-friendly Tailwind CSS design

### Technical Features
- **Firestore Database** - Scalable NoSQL with security rules
- **Firebase Storage** - Secure file uploads with user-scoped access
- **Serverless API Routes** - Next.js API routes for AI analysis
- **AI Integration** - Google Gemini API for deck analysis
- **Email Templates** - Resend/Postmark ready for production
- **Composite Indexes** - Optimized Firestore queries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project (free tier works)
- Google Gemini API key (free)
- Vercel account (free)

### 1. Clone the Repository

```bash
git clone https://github.com/jai281/fundflow-ai.git
cd fundflow-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Enable **Storage**
6. Register a **Web App** and copy the config

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GEMINI_API_KEY=your_gemini_api_key
```

### 5. Deploy Firestore Rules and Indexes

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize (if needed)
firebase init

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 6. Seed Investor Data

Run this script in Firebase Console > Firestore > Start in production mode > Import data, or use the Firebase Admin SDK:

```typescript
// scripts/seed-investors.ts
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, collection, addDoc } from 'firebase-admin/firestore';
import investors from '../src/data/seed-investors.json';

initializeApp();
const db = getFirestore();

async function seed() {
  for (const investor of investors) {
    await addDoc(collection(db, 'investors'), investor);
  }
  console.log('Seeded', investors.length, 'investors');
}

seed();
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GEMINI_API_KEY`
5. Click **Deploy**

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to add environment variables
```

## 📁 Project Structure

```
fundflow-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── analyze/        # Deck analysis endpoint
│   │   │   ├── match/          # Investor matching endpoint
│   │   │   └── outreach/       # Email template endpoint
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── analyze/        # Deck upload & analysis
│   │   │   ├── investors/      # Investor matching
│   │   │   └── outreach/       # Email outreach
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── data/
│   │   └── seed-investors.json # Sample investor data
│   ├── lib/
│   │   ├── ai.ts               # AI analysis logic
│   │   ├── auth.ts             # Firebase Auth helpers
│   │   ├── firebase.ts         # Firebase initialization
│   │   ├── firestore.ts        # Firestore operations
│   │   └── storage.ts          # Firebase Storage operations
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Composite indexes
├── storage.rules               # Storage security rules
├── .env.local.example          # Environment template
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── README.md                   # This file
```

## 🔒 Security

### Firestore Rules
- Users can only read/write their own data
- Investors collection is read-only for authenticated users
- All writes require authentication

### Storage Rules
- Users can only upload/read their own decks
- 10MB file size limit
- PDF and PPTX only

### Best Practices
- Never expose API keys in client-side code
- Use server-side API routes for sensitive operations
- Implement rate limiting for production
- Add email verification for signups

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes, Firebase
- **Database**: Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Auth**: Firebase Authentication
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 📈 Roadmap

- [ ] Stripe subscription billing
- [ ] Email delivery via Resend/Postmark
- [ ] Investor CRM pipeline tracking
- [ ] Meeting scheduler integration (Calendly)
- [ ] WhatsApp/Telegram notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Evalyze.ai](https://www.evalyze.ai)
- Built with Firebase, Next.js, and Vercel
- AI analysis powered by Google Gemini

---

**Built with ❤️ for founders raising their next round**

For questions or support, open an issue on GitHub.
