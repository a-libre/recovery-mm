# Deployment Guide for Production

## Problem
The AI chat requires a backend server to proxy API calls. Static hosting (GitHub Pages, basic hosting) won't work.

## Solution: Serverless Function Deployment

I've created a serverless function at `/api/chat.js` that will work on Vercel or Netlify.

---

## **Option A: Deploy to Vercel (Recommended)**

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
cd /Users/alexlibre/Desktop/recovery-mm
vercel
```

### 4. Set Environment Variable
```bash
vercel env add GROQ_API_KEY
```
When prompted, paste your API key (found in `.env` file)

Select "Production" when asked which environment.

### 5. Redeploy with Environment Variable
```bash
vercel --prod
```

### 6. Update Your Domain
If you want to use your custom domain `t4monk.recovery.fyi`:
- Go to your Vercel dashboard
- Click on your project
- Go to Settings > Domains
- Add `t4monk.recovery.fyi`

---

## **Option B: Deploy to Netlify**

### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Login to Netlify
```bash
netlify login
```

### 3. Deploy
```bash
cd /Users/alexlibre/Desktop/recovery-mm
netlify deploy --prod
```

### 4. Set Environment Variable
```bash
netlify env:set GROQ_API_KEY your_groq_api_key_here
```

### 5. Update Your Domain
- Go to your Netlify dashboard
- Click on your site
- Go to Domain Settings
- Add `t4monk.recovery.fyi`

---

## **Option C: Keep Current Hosting, Deploy API Separately**

If you want to keep `t4monk.recovery.fyi` as-is and just add the API:

### 1. Deploy just the serverless function to Vercel:
```bash
vercel --prod
```

### 2. Note the Vercel URL (e.g., `https://your-project.vercel.app`)

### 3. Update `ai-chat.js` line 5:
Change from:
```javascript
const CHAT_API_URL = "/ai/chat";
```

To:
```javascript
const CHAT_API_URL = "https://your-project.vercel.app/ai/chat";
```

### 4. Redeploy your static site to t4monk.recovery.fyi

---

## Quick Start (Fastest)

```bash
# Install Vercel
npm install -g vercel

# Deploy
cd /Users/alexlibre/Desktop/recovery-mm
vercel

# Set API key
vercel env add GROQ_API_KEY
# Paste your API key when prompted
# Select: Production

# Deploy to production
vercel --prod
```

Done! Your site will be live at the Vercel URL.

---

## Files Created
- `/api/chat.js` - Serverless function for AI chat
- `vercel.json` - Vercel configuration
- `netlify.toml` - Netlify configuration

## Important
⚠️ **Never commit your actual API key to git!** The key should only be set as an environment variable on your hosting platform.

