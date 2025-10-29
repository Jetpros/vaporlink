# VaporLink – Product Requirements Document (PRD)
**"Share a link. Chat for 24 hours. Vanish forever."**

## 1. Product Overview

| Item | Details |
|------|---------|
| **Name** | VaporLink |
| **Tagline** | Ephemeral chat links that disappear in 24 hours. |
| **Type** | Web app (PWA), open-source, full-stack Next.js |
| **Core Value** | Instant, private, time-bound group chats — no signup required to join. |
| **Tech Stack** | Next.js 14 (App Router), shadcn/ui, Tailwind CSS, TypeScript, Prisma + PostgreSQL, Supabase/Google OAuth, Socket.io (or Pusher/Upstash), Vercel |
| **Open Source** | Yes – MIT License on GitHub |

## 2. Target Users

- **Casual Users** – Want quick, private group chats (e.g., event planning, study groups, memes).
- **Privacy-Conscious** – Avoid permanent data trails.
- **Developers** – Want to fork, customize, self-host.
- **Teams** – Quick standups, brainstorming, file drops.

## 3. Core Features

### 3.1 Landing Page (Public)

- Futuristic, dark-mode-first, animated vapor particles (Three.js or CSS).
- **Hero section:**
  - "Create a chat link in 3 seconds. It dies in 24 hours. No trace left."
- **Features grid:**
  - No signup to join
  - Password-protected (optional)
  - 10 participants max
  - Files, voice, video, images
  - Real-time typing & online indicators
  - Auto-delete after 24h
- **CTA:** "Create Link Now" → goes to `/create`

### 3.2 Link Creation (`/create`)

- **No login required** to create.
- **Form:**
  - Link Name (optional, e.g., "Project Sync")
  - Password (toggle: off/on) → if on, input field appears
  - Expire in: Fixed 24 hours (countdown starts on first join)
  - Button: **Generate Link**
- On success → copyable link: `vaporlink.app/c/[unique-id]`
- Share modal with QR code, copy button, social share.

### 3.3 Join Flow (`/c/[id]`)

- User opens link → **Join Screen**
  - Show room name, participant count, time left
  - Input: Display Name (optional)
  - Avatar: Upload or auto-generate (DiceBear/Avataaars)
  - Password (if set) → prompt
  - Click **Join Chat** → enter room
- If no name/avatar → system auto-generates: `Guest#1234` + random avatar

### 3.4 Chat Room Interface

**Design:** Futuristic, glassmorphism, neon accents, smooth animations (shadcn + Framer Motion)

**Layout:**

- **Top Bar:**
  - Room name
  - Countdown Timer (live: `23h 45m 12s`)
  - Online Users (avatars in a row, max 10, tooltip on hover)
  - Leave Room button
  
- **Main Chat:**
  - Message bubbles (sender name, timestamp, avatar)
  - Typing indicator: *"Alex is typing..."* (real-time)
  - **Message types:**
    - Text
    - Images (preview + download)
    - Videos (preview + play inline)
    - Audio Messages (record + play)
    - Files (PDF, DOC, ZIP, etc. – download)
    - Emojis & Reactions (click to react)
  
- **Input Bar:**
  - Text input
  - Emoji picker
  - Attach: Camera, Gallery, File, Mic (voice recording)
  - Send button (Enter to send)

### 3.5 Authentication (Optional)

- **Login / Signup** → `/auth`
  - Google OAuth
  - Email + Password (with magic link option)
- **Why login?**
  - Save created links in dashboard
  - View past rooms (until expiry)
  - Customize default avatar/name
  - Rate limiting protection

### 3.6 Dashboard (`/dashboard`) – Logged-in Users

- **List of My Created Links**
  - Name, ID, Created At, Expires In, Participants
  - Copy Link, Delete Early, View Stats
  - Expired Links → grayed out

## 4. Advanced & Awesome Features

| Feature | Description |
|---------|-------------|
| **Real-time Sync** | Socket.io for messages, typing, online status |
| **End-to-End Encryption (Optional)** | Toggle in create → client-side encrypt (WebCrypto) |
| **Voice Messages** | Hold-to-record, waveform preview |
| **Live Reactions** | Floating emojis on long press |
| **Message Threads** | Reply to specific message |
| **Dark/Light Mode** | Auto + manual toggle |
| **PWA Support** | Installable on mobile/desktop |
| **QR Code Login** | Scan to join from phone |
| **Link Preview** | OG tags: title, timer, participant count |
| **Auto-Delete Confirmation** | At 1h left: banner "This room vanishes in 1 hour" |
| **Export Chat** | Before expiry: download as .txt or .pdf |
| **Rate Limiting** | 5 links/hour per IP (anon), 50/day if logged in |
| **Abuse Reporting** | Flag message → admin review (self-hosted) |

## 5. Data & Privacy

### 24-Hour Auto-Delete
- All messages, files, metadata permanently deleted after 24h from first join.
- Background job (Cron via Vercel or Upstash) runs every minute.

### Files
- Stored in temporary bucket (e.g., Supabase Storage with lifecycle policy)
- Encrypted at rest
- Deleted with room

### No Logs
- No user tracking
- No analytics by default (opt-in PostHog for open-source users)

## 6. Technical Architecture

### Database Schema (Prisma)

```prisma
model Room {
  id          String    @id @default(cuid())
  name        String?
  uniqueId    String    @unique
  password    String?
  createdAt   DateTime  @default(now())
  expiresAt   DateTime
  firstJoinAt DateTime?
  creatorId   String?
  maxUsers    Int       @default(10)
  
  creator     User?     @relation(fields: [creatorId], references: [id])
  messages    Message[]
  participants Participant[]
}

model Message {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  content   String
  type      String   // text, image, video, audio, file
  fileUrl   String?
  createdAt DateTime @default(now())
  
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
}

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  avatar        String?
  provider      String?   // google, email
  createdAt     DateTime  @default(now())
  
  rooms         Room[]
  messages      Message[]
  participants  Participant[]
}

model Participant {
  id          String   @id @default(cuid())
  roomId      String
  userId      String?
  displayName String
  avatar      String
  joinedAt    DateTime @default(now())
  isOnline    Boolean  @default(true)
  
  room        Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user        User?    @relation(fields: [userId], references: [id])
}
```

### API Routes

- `POST /api/rooms/create` - Create new room
- `GET /api/rooms/[id]` - Get room details
- `POST /api/rooms/[id]/join` - Join room
- `DELETE /api/rooms/[id]` - Delete room (creator only)
- `POST /api/messages` - Send message
- `GET /api/messages/[roomId]` - Get room messages
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers
- `POST /api/upload` - File upload endpoint

### Real-time Events (Socket.io)

- `join-room` - User joins room
- `leave-room` - User leaves room
- `new-message` - New message sent
- `typing-start` - User starts typing
- `typing-stop` - User stops typing
- `user-online` - User comes online
- `user-offline` - User goes offline
- `reaction-add` - Reaction added to message

## 7. Development Phases

### Phase 1: Core MVP (Week 1-2)
- [ ] Next.js setup with App Router
- [ ] Basic landing page
- [ ] Room creation (/create)
- [ ] Room join flow (/c/[id])
- [ ] Basic text chat with Socket.io
- [ ] Database schema with Prisma
- [ ] Auto-delete cron job

### Phase 2: Rich Features (Week 3-4)
- [ ] File uploads (images, videos, audio, files)
- [ ] Voice messages
- [ ] Typing indicators
- [ ] Online status
- [ ] Reactions
- [ ] Password protection

### Phase 3: Auth & Dashboard (Week 5)
- [ ] NextAuth.js setup
- [ ] Google OAuth
- [ ] Email/Password auth
- [ ] User dashboard
- [ ] Link management

### Phase 4: Polish & Advanced (Week 6-7)
- [ ] PWA setup
- [ ] Dark/light mode
- [ ] QR code generation
- [ ] Export chat
- [ ] E2E encryption (optional)
- [ ] Rate limiting
- [ ] Abuse reporting

### Phase 5: Deploy & Launch (Week 8)
- [ ] Vercel deployment
- [ ] Database setup (Supabase/Railway)
- [ ] Environment variables
- [ ] Domain setup
- [ ] Documentation
- [ ] Open source release

## 8. Success Metrics

- **Adoption:** 1000+ rooms created in first month
- **Engagement:** Average 8+ messages per room
- **Retention:** 30% of users create multiple rooms
- **Performance:** <2s page load, <100ms message latency
- **Privacy:** 100% auto-delete compliance

---

**Last Updated:** October 2025
**Version:** 1.0
**License:** MIT
