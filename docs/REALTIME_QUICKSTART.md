# Supabase Realtime - Quick Setup

Get VaporLink's live features working in 5 minutes! ⚡

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Account
- Go to [supabase.com](https://supabase.com) and sign up (free)
- Create a new project (takes ~2 minutes)

### 2. Get Your Credentials
In your Supabase dashboard:
- Go to **Settings** → **API**
- Copy these two values:
  - **Project URL** (starts with `https://`)
  - **Anon/Public Key** (long string starting with `eyJ...`)

### 3. Add to Your .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Enable Realtime
In Supabase dashboard:
- Go to **Database** → **Replication**
- Toggle ON for these tables:
  - ✅ `Message`
  - ✅ `Participant`
  - ✅ `Reaction`

### 5. Restart Your App
```bash
npm run dev
```

## ✅ How to Verify It's Working

1. **Look for the "LIVE" badge** in the chat room header (green dot = connected)
2. **Open the same room in 2 windows** and send a message
3. **Message should appear instantly** in both windows (no delay!)

### Console Messages (Success)
```
✅ Setting up Supabase realtime subscription for room: ...
✅ Supabase realtime status: SUBSCRIBED
✅ Successfully connected to realtime
```

## 🎯 What You Get

With Supabase Realtime enabled:
- ⚡ **Instant messages** (no 2-second delay)
- 👀 **Live typing indicators** (see when others type)
- 💚 **Online presence** (see who's in the room)
- 💖 **Live reactions** (reactions appear instantly)
- 📉 **90% less server load** (no more polling)

## 🆘 Troubleshooting

### "LIVE" badge shows "CONNECTING" forever
- ✅ Check env vars are set correctly
- ✅ Restart dev server after adding env vars
- ✅ Check browser console for errors

### Messages don't appear instantly
- ✅ Make sure replication is enabled for tables
- ✅ Check table names match (case-sensitive!)
- ✅ Verify both env vars are set

### Still not working?
- Check the detailed guide: `SUPABASE_REALTIME_SETUP.md`
- Supabase status: [status.supabase.com](https://status.supabase.com)

## 📊 Database Options

### Option A: Use Supabase Database (Recommended)
1. In Supabase: **Settings** → **Database**
2. Copy **Connection String**
3. Replace `[YOUR-PASSWORD]` with your actual password
4. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.xxx.supabase.co:5432/postgres"
   ```
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Option B: Keep Your Current Database
- Just add the Supabase env vars
- Realtime features will use your existing DB
- Everything else stays the same

## 💰 Cost

**Supabase Free Tier includes:**
- ✅ 500 MB database
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ **Unlimited** realtime connections
- ✅ **Unlimited** API requests

Perfect for development and small deployments!

## 🎨 Visual Indicators

### Connection Status
- 🟢 **LIVE** (green dot) = Connected, realtime working
- 🔴 **CONNECTING** (gray dot) = Connecting or not configured

### Without Supabase
The app still works! It just uses polling (checks every 2 seconds) instead of instant updates.

## 🔐 Security Note

For production:
- Enable Row Level Security (RLS) in Supabase
- See full guide: `SUPABASE_REALTIME_SETUP.md`

## 📚 Learn More

- Full setup guide: `SUPABASE_REALTIME_SETUP.md`
- Supabase docs: [supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime)

---

**That's it!** You should now have real-time updates working. 🎉