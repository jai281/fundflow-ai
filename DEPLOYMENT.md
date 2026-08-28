# FundFlow AI - Complete Deployment Guide

This guide walks you through deploying FundFlow AI to production.

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier works)
- Vercel account (free tier works)
- Google Gemini API key (free)

## Step 1: Set Up Firebase Project

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name: `fundflow-ai` (or your preferred name)
4. Disable Google Analytics (optional for now)
5. Click **Create project**

### 1.2 Enable Firebase Services

#### Authentication
1. Go to **Build** > **Authentication**
2. Click **Get started**
3. Enable **Email/Password** sign-in method
4. Click **Save**

#### Firestore Database
1. Go to **Build** > **Firestore Database**
2. Click **Create database**
3. Start in **production mode** (we'll deploy rules next)
4. Choose a location (e.g., `asia-south1` for India, `us-central1` for US)
5. Click **Enable**

#### Storage
1. Go to **Build** > **Storage**
2. Click **Get started**
3. Start in **production mode**
4. Choose a location (same as Firestore)
5. Click **Done**

### 1.3 Register Web App

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click the **Web** icon (</>)
4. Register app with nickname: `FundFlow AI Web`
5. Copy the `firebaseConfig` object - you'll need this for `.env.local`

### 1.4 Deploy Security Rules and Indexes

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (run from fundflow-ai folder)
firebase init

# Select:
# - Firestore: Yes (use existing)
# - Storage: Yes (use existing)
# - Hosting: No (we're using Vercel)
# - Firestore rules: firestore.rules (already exists)
# - Firestore indexes: firestore.indexes.json (already exists)
# - Storage rules: storage.rules (already exists)

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 1.5 Seed Investor Data

#### Option A: Manual Import (Recommended for MVP)

1. Go to Firebase Console > Firestore Database
2. Click **Start collection**
3. Collection ID: `investors`
4. Manually add documents using data from `src/data/seed-investors.json`

#### Option B: Use Admin SDK Script

```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Download service account key:
# 1. Go to Project Settings > Service Accounts
# 2. Click "Generate new private key"
# 3. Save the JSON file as `serviceAccountKey.json` in the project root

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"

# Run seed script
node scripts/seed-investors.js
```

## Step 2: Configure Environment Variables

### 2.1 Create .env.local

```bash
cp .env.local.example .env.local
```

### 2.2 Fill in Firebase Config

From Firebase Console > Project Settings > General > Your apps > SDK setup and configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 2.3 Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Click **Get API key**
3. Create API key
4. Add to `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 3: Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test Checklist:
- [ ] Sign up with email/password works
- [ ] Login works
- [ ] Dashboard loads with user profile
- [ ] Deck upload and analysis works
- [ ] Investor matching works
- [ ] Outreach email templates generate

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository: `jai281/fundflow-ai`
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `./out` (leave blank for auto-detect)
5. Add **Environment Variables**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GEMINI_API_KEY`
6. Click **Deploy**
7. Wait for build to complete (~2-3 minutes)
8. Click **Visit** to see your live site

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? fundflow-ai
# - Directory? ./
# - Override settings? N

# Add environment variables when prompted
# Or set them in Vercel dashboard after deployment
```

### Option C: Auto-Deploy on Git Push

Once connected via Option A, every push to `main` branch will auto-deploy.

## Step 5: Post-Deployment Verification

### 5.1 Test Production URL

1. Visit your Vercel URL (e.g., `https://fundflow-ai.vercel.app`)
2. Test sign up, login, deck upload, and analysis
3. Verify Firebase Storage uploads work
4. Check Firestore for new user/deck documents

### 5.2 Check Build Logs

1. Go to Vercel Dashboard > Your Project > Deployments
2. Click latest deployment
3. Review **Build Logs** for any errors
4. Check **Function Logs** for API route errors

### 5.3 Configure Custom Domain (Optional)

1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add your domain (e.g., `fundflow.ai`)
3. Update DNS records as instructed
4. Wait for SSL certificate (~5 minutes)

## Step 6: Production Hardening

### 6.1 Enable Firebase App Check (Optional but Recommended)

1. Go to Firebase Console > Build > App Check
2. Register your app
3. Add reCAPTCHA v3 provider
4. Update Firebase initialization in `src/lib/firebase.ts`

### 6.2 Set Up Monitoring

1. Go to Firebase Console > Build > Crashlytics (for mobile)
2. Go to Firebase Console > Build > Performance (for web performance)
3. Enable Google Analytics for usage tracking

### 6.3 Configure CORS for Storage

If you get CORS errors when uploading from production:

1. Go to Firebase Console > Storage
2. Click on the bucket name
3. Edit CORS configuration

### 6.4 Add Rate Limiting

For production, add rate limiting to API routes:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add rate limiting headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');
  return response;
}
```

## Step 7: Email Integration (Production)

### 7.1 Set Up Resend

1. Go to [Resend](https://resend.com)
2. Sign up and create API key
3. Add verified domain
4. Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

### 7.2 Update Outreach API Route

```typescript
// src/app/api/outreach/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In the POST handler:
await resend.emails.send({
  from: process.env.FROM_EMAIL!,
  to: 'founder@example.com',
  subject: 'Test',
  text: email,
});
```

## Troubleshooting

### Build Fails on Vercel

1. Check build logs for specific error
2. Common issues:
   - Missing environment variables
   - TypeScript errors (run `npm run build` locally to catch)
   - Dependency version conflicts

### Firebase Storage Upload Fails

1. Verify storage rules are deployed: `firebase deploy --only storage`
2. Check browser console for CORS errors
3. Ensure user is authenticated before upload

### API Routes Return 500

1. Check Vercel Function Logs
2. Verify `GEMINI_API_KEY` is set in Vercel environment
3. Test API locally with same environment variables

### Firestore Permission Denied

1. Verify rules are deployed: `firebase deploy --only firestore:rules`
2. Check user is authenticated
3. Verify document `userId` matches authenticated user UID

## Cost Estimates

### Firebase (Free Tier)
- Authentication: 50,000 MAU free
- Firestore: 1 GB storage, 50,000 reads/day, 20,000 writes/day
- Storage: 5 GB, 1 GB/day downloads
- **Estimated cost for MVP**: $0/month (free tier sufficient for 100-500 users)

### Vercel (Free Tier)
- 100 GB bandwidth/month
- Unlimited deployments
- **Estimated cost**: $0/month

### Google Gemini API
- Free tier: 60 requests/minute
- **Estimated cost**: $0-10/month for MVP (depends on usage)

**Total estimated monthly cost**: $0-10 for MVP

## Next Steps After Deployment

1. **Add Stripe Billing** - Implement subscription tiers
2. **Email Delivery** - Integrate Resend/Postmark for actual email sending
3. **Analytics** - Add PostHog or Google Analytics
4. **SEO** - Add meta tags, Open Graph images
5. **Legal** - Add Terms of Service, Privacy Policy pages
6. **Support** - Add Intercom or Crisp for customer support

---

**Need help?** Open an issue on GitHub or contact support.
