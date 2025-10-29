# VaporLink Setup Guide

This guide will help you set up and run VaporLink locally or deploy it to production.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- (Optional) Google OAuth credentials
- (Optional) Supabase account for file storage

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database for VaporLink:

```bash
# Using psql
createdb vaporlink

# Or using a GUI tool like pgAdmin, TablePlus, etc.
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/vaporlink"

# NextAuth - Generate a random secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Google OAuth (Optional - for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase Storage (Optional - for file uploads)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Cron Secret (for cleanup job)
CRON_SECRET="your-random-secret"
```

#### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

#### Get Google OAuth Credentials (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

#### Get Supabase Credentials (Optional)

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → API
4. Copy Project URL and anon/public key
5. Go to Settings → Database and get service role key

### 4. Initialize Database

Run Prisma migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vaporlink/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── rooms/          # Room management
│   │   ├── messages/       # Message handling
│   │   └── cron/           # Cleanup jobs
│   ├── c/[id]/             # Chat room page
│   ├── create/             # Create room page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   └── chat/               # Chat components
├── lib/                     # Utilities
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── prisma/                  # Database
│   └── schema.prisma       # Database schema
└── public/                  # Static assets
```

## Features Implementation Status

### ✅ Completed (MVP)

- [x] Landing page with futuristic design
- [x] Room creation with optional password
- [x] QR code generation for room links
- [x] Join room flow
- [x] Basic text chat
- [x] Real-time countdown timer
- [x] Participant list with avatars
- [x] Auto-delete cron job
- [x] Database schema with Prisma
- [x] Responsive design

### 🚧 In Progress / To Be Implemented

- [ ] Real-time Socket.io integration
- [ ] File uploads (images, videos, audio)
- [ ] Voice messages
- [ ] Emoji picker
- [ ] Message reactions
- [ ] Typing indicators (real-time)
- [ ] Online status (real-time)
- [ ] NextAuth authentication
- [ ] User dashboard
- [ ] Message threads/replies
- [ ] End-to-end encryption
- [ ] PWA setup
- [ ] Export chat feature

## Adding Real-Time Features (Socket.io)

The current implementation polls for messages. To add real-time updates:

### 1. Create Socket.io Server

Create `server/socket.js`:

```javascript
const { createServer } = require('http')
const { Server } = require('socket.io')

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', ({ roomId, participantId }) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-joined', { participantId })
  })

  socket.on('send-message', (message) => {
    io.to(message.roomId).emit('new-message', message)
  })

  socket.on('typing-start', ({ roomId, participantId }) => {
    socket.to(roomId).emit('user-typing', { participantId })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})
```

### 2. Run Socket.io Server

```bash
npm run socket
```

### 3. Update ChatRoom Component

Replace polling with Socket.io client connection in `components/chat/ChatRoom.tsx`.

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Prepare Database**
   - Create a PostgreSQL database (Railway, Supabase, Neon, etc.)
   - Get connection string

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all variables from `.env.example`

5. **Set Up Domain**
   - Add custom domain in Vercel Dashboard
   - Update `NEXTAUTH_URL` environment variable

6. **Enable Cron Jobs**
   - Vercel automatically runs cron jobs defined in `vercel.json`
   - Make sure to set `CRON_SECRET` environment variable

### Alternative: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t vaporlink .
docker run -p 3000:3000 --env-file .env vaporlink
```

## Database Management

### View Database

```bash
npx prisma studio
```

### Run Migrations

```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database

```bash
npx prisma migrate reset
```

### Seed Database (Optional)

Create `prisma/seed.ts` for test data.

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure database exists

### Module Not Found Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
npx prisma generate
```

### Build Errors

```bash
npm run build
```

Check output for specific errors.

## Testing Locally

1. **Create a Room**
   - Go to http://localhost:3000
   - Click "Create Link Now"
   - (Optional) Set password
   - Click "Generate Link"

2. **Join Room**
   - Copy the generated link
   - Open in new incognito window
   - Enter display name
   - Join chat

3. **Test Chat**
   - Send messages between windows
   - Verify messages appear
   - Check countdown timer
   - Test participant list

## Performance Tips

- Use Redis for Socket.io adapter in production
- Enable database connection pooling
- Set up CDN for static assets
- Enable Next.js image optimization
- Monitor database query performance with Prisma

## Security Considerations

- Keep `NEXTAUTH_SECRET` and `CRON_SECRET` secure
- Use environment variables for all secrets
- Enable CORS only for your domain
- Implement rate limiting for API routes
- Validate all user inputs
- Sanitize message content to prevent XSS

## Contributing

See [README.md](README.md) for contribution guidelines.

## Support

- GitHub Issues: [Report bugs or request features]
- Documentation: [Link to docs]
- Discord: [Community chat]

---

**Need help?** Open an issue on GitHub or reach out on Discord!
