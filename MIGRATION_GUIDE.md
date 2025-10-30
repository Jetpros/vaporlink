# VaporLink - In-Memory Architecture Migration Guide

## Overview

VaporLink has been migrated from a database-backed architecture to an **in-memory storage system** with the following changes:

### What Changed

#### ✅ Removed
- ❌ **PostgreSQL Database** (Prisma + Supabase)
- ❌ **Prisma ORM** - No more schema migrations or database queries
- ❌ **Supabase Realtime** - Replaced with custom Socket.IO
- ❌ **NextAuth Prisma Adapter** - Now using JWT-only sessions

#### ✅ Added
- ✨ **In-Memory Data Store** (`/lib/memory-store.ts`)
- ✨ **Custom Socket.IO Server** (`/server/socket-server.ts`)
- ✨ **Cloudinary Integration** (`/lib/cloudinary.ts`)
- ✨ **Custom Server** (`/server/index.ts`)

---

## New Architecture

### 1. In-Memory Data Store

All data is stored in JavaScript Maps and Arrays:

```typescript
import { memoryStore } from '@/lib/memory-store';

// Create a room
const room = memoryStore.createRoom({
  uniqueId: 'abc123',
  name: 'My Room',
  // ...
});

// Get messages
const messages = memoryStore.getMessagesByRoomId(room.id);
```

**Key Features:**
- Automatic cleanup of expired rooms every 5 minutes
- Fast in-memory operations
- No database connection required
- Data persists only during server runtime

### 2. Socket.IO Real-Time Connection

Custom Socket.IO server handles all real-time features:

**Server Events:**
- `room:join` - User joins a room
- `room:leave` - User leaves a room
- `typing:start` / `typing:stop` - Typing indicators
- `message:send` - Send messages

**Client Events:**
- `message:new` - New message received
- `participant:join` / `participant:leave` - Participant updates
- `reaction:add` - Reaction added
- `typing:start` / `typing:stop` - Typing indicators

### 3. Cloudinary File Storage

All file uploads (images, videos, audio, documents) are stored in Cloudinary:

```typescript
import { uploadToCloudinary } from '@/lib/cloudinary';

const result = await uploadToCloudinary(fileData, 'vaporlink', 'image');
console.log(result.secureUrl); // Cloudinary URL
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment Variables

Update your `.env` or `.env.local` file:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
CLOUDINARY_UPLOAD_PRESET="vaporlink-uploads"

# Rate Limiting (Optional)
RATE_LIMIT_ANON_PER_HOUR=5
RATE_LIMIT_AUTH_PER_DAY=50

# Cron Secret (Optional - for cleanup endpoint)
CRON_SECRET="your-random-secret"
```

### 3. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the Dashboard
3. (Optional) Create an upload preset for unsigned uploads

### 4. Start the Server

```bash
yarn dev
```

The custom server will start on `http://localhost:3000` with Socket.IO enabled.

### 5. Production Build

```bash
yarn build
yarn start
```

---

## API Routes Updated

All API routes have been migrated to use the memory store:

### Rooms
- `POST /api/rooms/create` - Create a new room
- `GET /api/rooms/[id]` - Get room details
- `DELETE /api/rooms/[id]` - Delete a room
- `POST /api/rooms/[id]/join` - Join a room

### Messages
- `GET /api/messages?roomId=xxx` - Get messages for a room
- `POST /api/messages` - Send a message
- `POST /api/messages/[messageId]/react` - Add/remove reaction

### Participants
- `GET /api/participants?roomId=xxx` - Get participants in a room
- `POST /api/participants/[id]/seen` - Update last seen timestamp

### Uploads
- `POST /api/upload` - Upload file to Cloudinary
- `GET /api/upload` - Get Cloudinary configuration

### Cleanup
- `GET /api/cron/cleanup` - Manual cleanup (requires CRON_SECRET)

---

## Frontend Hooks

### useSocket (Replaces useRealtime)

```typescript
import { useSocket } from '@/hooks/use-socket';

const { isConnected, broadcastTyping } = useSocket({
  roomId,
  participantId,
  callbacks: {
    onNewMessage: (message) => {
      console.log('New message:', message);
    },
    onParticipantJoin: (participant) => {
      console.log('Participant joined:', participant);
    },
  },
});
```

---

## Data Persistence

### ⚠️ Important: Data is Not Persistent

Since data is stored in memory:

- **Data is lost when the server restarts**
- Rooms automatically expire based on their duration
- This is ideal for ephemeral chat applications
- Not suitable for long-term data storage

### Auto-Cleanup

The memory store automatically cleans up:
- Expired rooms (every 5 minutes)
- Expired sessions (every 5 minutes)
- Expired rate limits (every 5 minutes)

---

## Deployment Considerations

### Vercel/Netlify
- ⚠️ Serverless functions have limitations with Socket.IO
- Consider using [Railway](https://railway.app), [Render](https://render.com), or [Fly.io](https://fly.io)

### Recommended Platforms
1. **Railway** - Best for Node.js apps with WebSockets
2. **Render** - Good WebSocket support
3. **Fly.io** - Global edge deployment
4. **DigitalOcean App Platform** - Traditional VPS-like experience

### Environment Variables
Ensure all required environment variables are set in your deployment platform.

---

## Monitoring

### Memory Usage

```typescript
import { memoryStore } from '@/lib/memory-store';

// Get statistics
const stats = memoryStore.getStats();
console.log(stats);
// {
//   rooms: 10,
//   messages: 150,
//   participants: 25,
//   reactions: 80,
//   users: 5,
//   sessions: 3,
//   rateLimits: 0
// }
```

### Cleanup Endpoint

Trigger manual cleanup:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/cleanup
```

---

## Benefits of In-Memory Architecture

✅ **Fast Performance** - No database round trips
✅ **Simple Setup** - No database configuration
✅ **Cost Effective** - No database hosting costs
✅ **Perfect for Ephemeral Data** - Ideal for temporary chat rooms
✅ **Real-Time by Default** - Socket.IO handles all real-time updates

## Limitations

⚠️ **Not Persistent** - Data is lost on server restart
⚠️ **Single Server** - No horizontal scaling (all data on one server)
⚠️ **Memory Limits** - Limited by server RAM
⚠️ **No Historical Data** - Cannot query past conversations

---

## Troubleshooting

### Socket.IO Not Connecting

1. Check `NEXT_PUBLIC_APP_URL` is set correctly
2. Verify server is running on the correct port
3. Check browser console for WebSocket errors

### Files Not Uploading

1. Verify Cloudinary credentials in `.env`
2. Check Cloudinary dashboard for upload errors
3. Ensure file size is within Cloudinary limits

### Memory Usage High

1. Check `memoryStore.getStats()` for data counts
2. Manually trigger cleanup: `GET /api/cron/cleanup`
3. Restart server to clear all memory

---

## Migration Checklist

- [x] Remove Prisma and PostgreSQL
- [x] Remove Supabase
- [x] Implement in-memory storage
- [x] Set up Socket.IO server
- [x] Configure Cloudinary
- [x] Update all API routes
- [x] Update frontend hooks
- [x] Remove database dependencies
- [x] Update environment variables
- [x] Test all features

---

## Support

For issues or questions:
1. Check the console logs for errors
2. Verify environment variables
3. Review Socket.IO connection status
4. Check memory store statistics

---

**Enjoy your database-free, in-memory VaporLink! 🚀**
