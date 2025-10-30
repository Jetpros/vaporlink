# 🚀 VaporLink Quick Start Guide

Get VaporLink up and running in 5 minutes!

## Step 1: Clone and Install

```bash
git clone https://github.com/yourusername/vaporlink.git
cd vaporlink
yarn install
```

## Step 2: Set Up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Go to your Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000

CLOUDINARY_CLOUD_NAME="your-cloud-name-here"
CLOUDINARY_API_KEY="your-api-key-here"
CLOUDINARY_API_SECRET="your-api-secret-here"
```

## Step 4: Start the Server

```bash
yarn dev
```

That's it! Open [http://localhost:3000](http://localhost:3000)

## What You Can Do Now

1. **Create a Room** - Click "Create Room" on the homepage
2. **Share the Link** - Copy the room URL and share with friends
3. **Chat in Real-Time** - Send messages, images, and files
4. **See Live Updates** - Typing indicators and participant presence

## Architecture Highlights

- ✅ **No Database Required** - Everything runs in memory
- ✅ **Real-Time by Default** - Socket.IO handles all live updates
- ✅ **File Storage in Cloud** - Cloudinary hosts all media files
- ✅ **Auto-Cleanup** - Expired rooms deleted automatically

## Next Steps

- Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed architecture info
- Check [README.md](./README.md) for full documentation
- Deploy to Railway, Render, or Fly.io for production use

## Troubleshooting

### Socket.IO not connecting?
- Check console for errors
- Verify `NEXT_PUBLIC_APP_URL` matches your actual URL

### File uploads failing?
- Double-check Cloudinary credentials
- Ensure they're in `.env.local` not `.env.example`

### Port 3000 already in use?
- Change `PORT=3001` in `.env.local`
- Update `NEXT_PUBLIC_APP_URL` accordingly

---

**Need help?** Check the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed troubleshooting.
