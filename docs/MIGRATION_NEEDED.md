# Database Migration Required

## ⚠️ Important: Run This Before Testing

The Prisma schema has been updated to support voice messages with duration tracking. You need to apply this migration to your database.

## 🔧 Steps to Apply Migration

### 1. Ensure DATABASE_URL is Set

Check your `.env` or `.env.local` file has:
```bash
DATABASE_URL="postgresql://..."
```

### 2. Run the Migration

```bash
npx prisma migrate dev --name add_duration_to_messages
```

This will:
- Create a new migration file
- Add the `duration` column to the `Message` table
- Update your database schema

### 3. Verify Prisma Client

```bash
npx prisma generate
```

This regenerates the Prisma client with the new field.

### 4. Restart Your IDE/TypeScript Server

The TypeScript lint error about `duration` will disappear after:
- Restarting your IDE, OR
- Reloading the TypeScript server (Cmd+Shift+P → "TypeScript: Restart TS Server")

## 📝 What Changed

### Prisma Schema (`prisma/schema.prisma`)

```diff
model Message {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  content   String   @db.Text
- type      String   @default("text") // text, image, video, audio, file
+ type      String   @default("text") // text, image, video, audio, file, voice
  fileUrl   String?
  fileName  String?
  fileSize  Int?
+ duration  Int?     // duration in seconds for voice/video messages
  createdAt DateTime @default(now())
  replyToId String?
  
  room      Room        @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user      Participant @relation(fields: [userId], references: [id], onDelete: Cascade)
  reactions Reaction[]
  replyTo   Message?    @relation("MessageReplies", fields: [replyToId], references: [id], onDelete: SetNull)
  replies   Message[]   @relation("MessageReplies")
  
  @@index([roomId, createdAt])
  @@index([userId])
}
```

### API Changes (`app/api/messages/route.ts`)

```diff
const sendMessageSchema = z.object({
  roomId: z.string(),
  participantId: z.string(),
- content: z.string(),
+ content: z.string().optional(),
- type: z.enum(['text', 'image', 'video', 'audio', 'file']).optional(),
+ type: z.enum(['text', 'image', 'video', 'audio', 'file', 'voice']).optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
+ duration: z.number().optional(),
  replyToId: z.string().optional(),
})
```

## 🧪 Test After Migration

1. **Voice Messages**:
   - Record a voice message
   - Send it
   - Verify it appears in chat
   - Check duration displays correctly

2. **Database**:
   ```sql
   SELECT id, type, duration FROM "Message" WHERE type = 'voice';
   ```

## ❓ Troubleshooting

### "Environment variable not found: DATABASE_URL"

**Solution**: Create `.env` or `.env.local` file:
```bash
cp .env.example .env
# Then edit .env and add your DATABASE_URL
```

### TypeScript Error Persists

**Solution**: 
1. Run `npx prisma generate` again
2. Restart IDE completely
3. Delete `node_modules/.prisma` folder and run `npm install`

### Migration Fails

**Solution**:
- Check database connection
- Ensure PostgreSQL is running
- Verify DATABASE_URL format
- Check database user has write permissions

## 📚 More Info

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**Once migration is complete, all features will work correctly! 🚀**
