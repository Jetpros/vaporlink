# 🎥 Daily.co Setup Guide

## Step 1: Create Daily.co Account

1. Go to https://dashboard.daily.co/signup
2. Sign up for a **free account** (no credit card required)
3. Verify your email

## Step 2: Get Your API Key

1. Log in to https://dashboard.daily.co
2. Go to **Developers** → **API Keys**
3. Copy your **API Key** (starts with a long string)

## Step 3: Add API Key to Your Project

1. Open `/Users/surf/Desktop/vaporlink/.env.local`
2. Add this line:
   ```
   DAILY_API_KEY="your-actual-api-key-here"
   ```
3. Replace `your-actual-api-key-here` with your real API key

## Step 4: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart
yarn dev
```

## Daily.co Free Tier Limits

✅ **Included for Free:**
- Up to 10 participants per call
- Unlimited calls
- Screen sharing
- Recording (limited)
- No time limits on calls

Perfect for development and small teams!

## What We'll Build

- **Create Daily rooms** automatically when calls start
- **Join Daily rooms** when users accept calls
- **Real video/audio streams** instead of placeholders
- **Screen sharing** capability
- **Mute/unmute** actually works
- **Camera on/off** actually works

## Next Steps

Once you've added your API key:
1. I'll create an API route to create Daily rooms
2. Update the call flow to use Daily
3. Replace the placeholder CallInterface with real video
4. Test with multiple users!

---

**Status**: ⏳ Waiting for Daily.co API key
**Next**: Add API key to `.env.local` and let me know!
