# 🌫️ VaporLink

**Ephemeral chat links that disappear in 24 hours.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-green)](https://socket.io/)

> "Share a link. Chat for 24 hours. Vanish forever."

## ✨ Features

- 🚀 **No Signup Required** - Join chats instantly with just a link
- ⏰ **24-Hour Auto-Delete** - All messages, files, and data vanish automatically
- 🔒 **Optional Password Protection** - Secure your chat rooms
- 👥 **Up to 10 Participants** - Perfect for small groups
- 💬 **Real-Time Chat** - Instant messaging with Socket.IO WebSockets
- ⚡ **Live Typing Indicators** - See when others are typing in real-time
- 📎 **Rich Media** - Share images, videos, audio, and files via Cloudinary
- 🎨 **Futuristic UI** - Beautiful glassmorphism design with neon accents
- 📱 **PWA Support** - Install on mobile and desktop
- 🌙 **Dark Mode First** - Easy on the eyes
- 🔐 **Privacy Focused** - No tracking, no permanent logs, in-memory storage
- 🌐 **WebSocket Support** - Custom Socket.IO server for real-time communication
- ⚡ **Lightning Fast** - In-memory storage for instant performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Cloudinary account (for file uploads)
- npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vaporlink.git
cd vaporlink

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Cloudinary credentials

# Run development server
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Required Environment Variables

```env
# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

**See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed setup instructions.**

## 📚 Documentation

All documentation has been organized in the `/docs` directory:

- **[Documentation Index](./docs/README.md)** - Complete guide to all documentation
- **[Quick Start](./docs/QUICKSTART.md)** - Get running in 5 minutes
- **[Setup Guide](./docs/SETUP.md)** - Detailed setup instructions
- **[Supabase Realtime](./docs/SUPABASE_REALTIME_SETUP.md)** - Enable real-time features
- **[Troubleshooting](./docs/DEBUGGING_FIXES.md)** - Common issues and solutions

### Key Documentation:

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./docs/QUICKSTART.md) | Fast setup guide |
| [REALTIME_QUICKSTART.md](./docs/REALTIME_QUICKSTART.md) | Enable realtime in 5 minutes |
| [PRD.md](./docs/PRD.md) | Product requirements |
| [ADVANCED_FEATURES.md](./docs/ADVANCED_FEATURES.md) | Feature documentation |
| [MESSAGE_DELIVERY_FIX.md](./docs/MESSAGE_DELIVERY_FIX.md) | Message troubleshooting |

Browse the `/docs` folder for comprehensive guides, implementation details, and troubleshooting help.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) with Custom Server
- **Language:** TypeScript
- **UI:** shadcn/ui + Tailwind CSS
- **Data Storage:** In-Memory (JavaScript Maps/Arrays)
- **Real-time:** Socket.IO (Custom Server)
- **File Storage:** Cloudinary
- **Auth:** NextAuth.js (JWT-based)
- **Deployment:** Railway, Render, Fly.io (WebSocket-compatible hosts)

## 📁 Project Structure

```
vaporlink/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (marketing)/       # Landing page
│   ├── c/[id]/           # Chat room pages
│   ├── create/           # Create room page
│   └── api/              # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat-specific components
│   └── landing/          # Landing page components
├── hooks/                 # Custom React hooks
│   └── use-socket.ts     # Socket.IO hook
├── lib/                   # Utilities
│   ├── memory-store.ts   # In-memory data store
│   ├── cloudinary.ts     # Cloudinary integration
│   └── utils.ts          # Helper functions
├── server/               # Custom Socket.IO server
│   ├── index.ts          # Server entry point
│   └── socket-server.ts  # Socket.IO logic
├── public/               # Static assets
└── styles/               # Global styles
```

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000

# Cloudinary (Required for file uploads)
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

**Note:** Authentication (NextAuth) and Google OAuth are optional and currently not actively used in the core chat functionality.

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

### Important: Choose a WebSocket-Compatible Host

VaporLink uses Socket.IO and requires a platform that supports WebSockets and persistent connections.

### Recommended Platforms

1. **Railway** (Easiest)
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Render**
   - Connect your GitHub repo
   - Select "Web Service"
   - Build command: `yarn build`
   - Start command: `yarn start`

3. **Fly.io**
   ```bash
   # Install Fly CLI
   curl -L https://fly.io/install.sh | sh
   
   # Deploy
   fly launch
   fly deploy
   ```

### ⚠️ Not Compatible
- **Vercel** - Serverless functions don't support persistent WebSocket connections
- **Netlify** - Similar serverless limitations

### Docker

```bash
# Build
docker build -t vaporlink .

# Run
docker run -p 3000:3000 \
  -e CLOUDINARY_CLOUD_NAME=your-name \
  -e CLOUDINARY_API_KEY=your-key \
  -e CLOUDINARY_API_SECRET=your-secret \
  vaporlink
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

## 🏗️ Architecture Notes

### In-Memory Storage
- All data is stored in JavaScript Maps during server runtime
- Data is **NOT persistent** - restarts will clear all rooms and messages
- Perfect for ephemeral chat applications
- Automatic cleanup of expired rooms every 5 minutes

### Real-Time Communication
- Custom Socket.IO server integrated with Next.js
- Room-based event broadcasting
- Typing indicators and live participant updates
- Automatic reconnection handling

### File Storage
- All media files (images, videos, audio, documents) stored in Cloudinary
- No local file storage
- Optimized delivery via Cloudinary CDN

### Scalability Considerations
- Single-server architecture (data stored in one server's memory)
- Not horizontally scalable without external state management
- Suitable for small to medium traffic loads
- Consider Redis or similar for multi-server deployments

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Next.js](https://nextjs.org/) for the amazing framework
- [Socket.IO](https://socket.io/) for real-time communication
- [Cloudinary](https://cloudinary.com/) for media storage

## 📧 Contact

- Website: [vaporlink.app](https://vaporlink.app)
- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@vaporlink](https://twitter.com/vaporlink)

---

Made with 💜 by the VaporLink team
