# vaporlink

This is an initial commit for the vaporlink project.

# 🌫️ VaporLink

**Ephemeral chat links that disappear in 24 hours.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

> "Share a link. Chat for 24 hours. Vanish forever."

## ✨ Features

- 🚀 **No Signup Required** - Join chats instantly with just a link
- ⏰ **24-Hour Auto-Delete** - All messages, files, and data vanish automatically
- 🔒 **Optional Password Protection** - Secure your chat rooms
- 👥 **Up to 10 Participants** - Perfect for small groups
- 💬 **Real-Time Chat** - Instant messaging with typing indicators
- 📎 **Rich Media** - Share images, videos, audio, and files
- 🎨 **Futuristic UI** - Beautiful glassmorphism design with neon accents
- 📱 **PWA Support** - Install on mobile and desktop
- 🌙 **Dark Mode First** - Easy on the eyes
- 🔐 **Privacy Focused** - No tracking, no permanent logs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vaporlink.git
cd vaporlink

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI:** shadcn/ui + Tailwind CSS
- **Database:** PostgreSQL + Prisma
- **Real-time:** Socket.io
- **Auth:** NextAuth.js
- **Storage:** Supabase Storage
- **Deployment:** Vercel

## 📁 Project Structure

```
vaporlink/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (marketing)/       # Landing page
│   ├── c/[id]/           # Chat room pages
│   ├── create/           # Create room page
│   ├── dashboard/        # User dashboard
│   └── api/              # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat-specific components
│   └── landing/          # Landing page components
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── socket.ts         # Socket.io setup
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma
├── public/               # Static assets
└── styles/               # Global styles
```

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Socket.io (if using external service)
SOCKET_URL="http://localhost:3001"
```

## 📚 API Documentation

### Create Room

```http
POST /api/rooms/create
Content-Type: application/json

{
  "name": "Project Sync",
  "password": "optional-password"
}
```

### Join Room

```http
POST /api/rooms/[id]/join
Content-Type: application/json

{
  "displayName": "John Doe",
  "avatar": "https://...",
  "password": "if-required"
}
```

### Send Message

```http
POST /api/messages
Content-Type: application/json

{
  "roomId": "room-id",
  "content": "Hello world",
  "type": "text"
}
```

## 🎨 Components

### Key Components

- `<ChatRoom />` - Main chat interface
- `<MessageBubble />` - Individual message display
- `<TypingIndicator />` - Shows who's typing
- `<FileUpload />` - Handle file uploads
- `<VoiceRecorder />` - Record voice messages
- `<CountdownTimer />` - Shows time remaining

## 🔐 Security

- Passwords are hashed using bcrypt
- Optional end-to-end encryption
- Rate limiting on room creation
- CSRF protection
- XSS sanitization

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build
docker build -t vaporlink .

# Run
docker run -p 3000:3000 vaporlink
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Next.js](https://nextjs.org/) for the amazing framework
- [Prisma](https://www.prisma.io/) for the excellent ORM

## 📧 Contact

- Website: [vaporlink.app](https://vaporlink.app)
- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@vaporlink](https://twitter.com/vaporlink)

---

Made with 💜 by the VaporLink team
