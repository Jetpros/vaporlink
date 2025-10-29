# Supabase Realtime Setup Guide

This guide will help you set up Supabase Realtime for VaporLink to enable WebSocket-based live updates instead of polling.

## Prerequisites

- A Supabase account (free tier works fine)
- Your existing PostgreSQL database

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details:
   - Name: `vaporlink` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
5. Wait for the project to be created (~2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon/Public Key** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Add Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Replace `your_project_url_here` and `your_anon_key_here` with your actual values from Step 2.

## Step 4: Migrate Your Database to Supabase (Optional)

If you want to use Supabase as your main database:

### Option A: Use Supabase's Database

1. In Supabase dashboard, go to **Settings** → **Database**
2. Copy the **Connection String** (make sure to use the one with `[YOUR-PASSWORD]`)
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. Update your `DATABASE_URL` in `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
   ```
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Option B: Use Your Existing Database with Supabase Realtime

You can keep your existing database and only use Supabase for Realtime:

1. Keep your existing `DATABASE_URL`
2. Just add the Supabase credentials as shown in Step 3
3. Skip the migration step

**Note:** For Option B to work, you'll need to set up a replication connection or use Supabase's connection pooler pointed to your database. This is more advanced and may require additional configuration.

## Step 5: Enable Realtime for Tables

In your Supabase dashboard:

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `Message`
   - `Participant`
   - `Reaction`

Click the toggle next to each table to enable real-time updates.

## Step 6: Set Up Row Level Security (RLS) - Optional but Recommended

For production, you should enable RLS policies:

1. Go to **Authentication** → **Policies**
2. For each table (`Message`, `Participant`, `Reaction`), create policies:

### Example Policy for Messages (Read):
```sql
CREATE POLICY "Enable read access for messages in user's rooms"
ON public."Message"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Participant"
    WHERE "Participant"."roomId" = "Message"."roomId"
  )
);
```

### Example Policy for Messages (Insert):
```sql
CREATE POLICY "Enable insert for authenticated users"
ON public."Message"
FOR INSERT
WITH CHECK (true);
```

**Note:** For development, you can disable RLS temporarily, but enable it for production.

## Step 7: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open your browser console and look for these messages:
   - `"Setting up Supabase realtime subscription for room: ..."`
   - `"Supabase realtime status: SUBSCRIBED"`
   - `"Successfully connected to realtime"`

3. In the chat room header, you should see a "LIVE" badge with a green dot

## Step 8: Verify Realtime is Working

1. Open the same chat room in two different browser windows
2. Send a message from one window
3. It should appear instantly in the other window (no delay!)
4. You should see console logs like:
   - `"Realtime: New message received"`

## Troubleshooting

### "LIVE" badge not showing or stays on "CONNECTING"

**Solution:**
- Check that your environment variables are set correctly
- Restart your dev server after adding the env vars
- Check browser console for errors

### Messages not appearing in realtime

**Solution:**
- Make sure replication is enabled for the tables in Supabase dashboard
- Check that your database schema matches (table names are case-sensitive!)
- Look for errors in the browser console

### "CHANNEL_ERROR" in console

**Solution:**
- Verify your Supabase credentials are correct
- Make sure the tables exist in your Supabase database
- Check that you've run the Prisma migrations

### Typing indicators not working

**Solution:**
- Make sure multiple users are in the same room
- Typing indicators use broadcast, which doesn't require database replication
- Check browser console for broadcast events

## Features Enabled with Realtime

✅ **Instant Message Updates** - Messages appear immediately without polling
✅ **Typing Indicators** - See when others are typing
✅ **Presence System** - See who's online in real-time
✅ **Live Reactions** - See reactions as they're added
✅ **Participant Updates** - See when people join/leave instantly
✅ **Reduced Server Load** - No more polling every 2 seconds
✅ **Better Performance** - WebSocket connections are more efficient

## Fallback Mode

If Supabase is not configured, VaporLink automatically falls back to polling (checking for new messages every 2 seconds). This means:

- The app still works without Supabase
- Users just won't have instant updates
- Typing indicators won't work
- More server load due to frequent API calls

## Cost Considerations

Supabase Free Tier includes:
- 500 MB database space
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests
- Realtime connections

This is more than enough for development and small deployments!

## Production Checklist

Before going to production with Supabase Realtime:

- [ ] Enable Row Level Security (RLS) policies
- [ ] Set up proper authentication
- [ ] Configure connection pooling if needed
- [ ] Monitor your Supabase usage in the dashboard
- [ ] Set up database backups
- [ ] Configure proper CORS settings
- [ ] Test with multiple concurrent users
- [ ] Set up error tracking (e.g., Sentry)

## Additional Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:
1. Check the Supabase status page: [status.supabase.com](https://status.supabase.com)
2. Review Supabase logs in your dashboard under **Logs**
3. Check your browser console for detailed error messages
4. Review the VaporLink console logs for realtime events

---

**Note:** Supabase Realtime uses PostgreSQL's replication features. Make sure your database supports logical replication (most modern PostgreSQL versions do).