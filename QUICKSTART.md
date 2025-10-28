# 🚀 VaporLink Quick Start

Get VaporLink running in under 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)

## Installation

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd vaporlink
npm install
```

### 2. Set Up Database

**Option A: Local PostgreSQL**
```bash
createdb vaporlink
```

**Option B: Use a hosted database**
- [Railway](https://railway.app/) - Free tier available
- [Supabase](https://supabase.com/) - Free tier available
- [Neon](https://neon.tech/) - Free tier available

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` - **Minimum required:**

```env
# Database - Replace with your connection string
DATABASE_URL="postgresql://username:password@localhost:5432/vaporlink"

# Auth Secret - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="paste-generated-secret-here"

# App URL
NEXTAUTH_URL="http://localhost:3000"

# Cron Secret - Any random string
CRON_SECRET="your-random-secret-123"
```

**Generate secrets:**
```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For CRON_SECRET (any random string works)
echo "cron-$(openssl rand -hex 16)"
```

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the App!

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

## Test It Out

1. **Create a Room**
   - Click "Create Link Now"
   - (Optional) Add a room name and password
   - Click "Generate Link"
   - Copy the link

2. **Join the Room**
   - Open the link in a new incognito window
   - Enter a display name (or let it auto-generate)
   - Click "Join Chat"

3. **Chat!**
   - Send messages back and forth
   - Watch the countdown timer
   - See participants in real-time

## Common Issues

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Make sure database exists

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

## Next Steps

- **Add Authentication**: Configure Google OAuth (see SETUP.md)
- **Enable File Uploads**: Set up Supabase storage (see SETUP.md)
- **Real-time Chat**: Implement Socket.io (see SETUP.md)
- **Deploy**: Push to Vercel (see SETUP.md)

## Need Help?

- 📖 [Full Setup Guide](SETUP.md)
- 📘 [PRD Document](PRD.md)
- 🐛 [Report Issues](https://github.com/yourusername/vaporlink/issues)

---

Happy coding! 💜
