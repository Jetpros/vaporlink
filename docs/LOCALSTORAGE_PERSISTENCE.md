# LocalStorage Persistence Feature

## 🔄 Session Persistence

VaporLink now maintains your participant session across page reloads using localStorage, so you don't lose your identity when refreshing the browser.

## ✨ How It Works

### 1. **On First Join**
When you join a room for the first time:
- You enter your display name and avatar
- System stores your session data in localStorage:
  ```javascript
  {
    participantId: "clxxx...",
    displayName: "Your Name",
    avatar: "https://...",
    joinedAt: "2025-10-27T22:13:00.000Z"
  }
  ```
- Storage key format: `vaporlink_session_${roomId}`

### 2. **On Page Reload**
When you reload the page while in a room:
- System checks localStorage for existing session
- Verifies the participant still exists in the room
- Auto-joins you with your original identity
- **No need to re-enter display name!**

### 3. **Session Verification**
Before restoring a session:
- Fetches current room data from API
- Checks if your participant ID still exists
- If valid: Auto-join with stored credentials
- If invalid: Clears localStorage and shows join screen

### 4. **Session Cleanup**
Your session is automatically cleared when:
- You explicitly leave the room (click Leave button)
- Room is expired or deleted (410/404 errors)
- Room not found
- Participant no longer exists in room

## 🔐 Storage Structure

### Key Format
```
vaporlink_session_{roomId}
```

Example:
```
vaporlink_session_abc123xyz789
```

### Data Stored
```json
{
  "participantId": "clxxx123abc456",
  "displayName": "John Doe",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  "joinedAt": "2025-10-27T22:13:45.123Z"
}
```

## 📱 User Experience

### Before (Without Persistence)
1. Join room → Enter name → Chat
2. Reload page → **Re-enter name** → Chat as **new participant**
3. Multiple identities in same room ❌

### After (With Persistence)
1. Join room → Enter name → Chat
2. Reload page → **Auto-join** → Continue as **same participant** ✅
3. Maintains single identity ✅

## 🔧 Implementation Details

### Files Modified

1. **`app/c/[id]/page.tsx`**
   - Added `verifyAndRestoreSession()` function
   - Checks localStorage on component mount
   - Stores session data on successful join
   - Clears session on room errors

2. **`components/chat/ChatRoom.tsx`**
   - Added `handleLeave()` to clear localStorage
   - Added periodic "last seen" updates
   - Cleanup on unmount

3. **`components/chat/LeftSidebar.tsx`**
   - Added `onLeave` prop
   - Leave button clears session

4. **`app/api/participants/[id]/seen/route.ts`** (NEW)
   - Updates participant's `lastSeenAt` timestamp
   - Keeps participant marked as online

## 🎯 Features

### ✅ What Works

- **Persistent Identity**: Same display name and avatar on reload
- **Room-Specific**: Each room has its own session
- **Auto-Cleanup**: Expired/deleted rooms clear storage
- **Verification**: Validates session before restoring
- **Multiple Rooms**: Can have sessions in different rooms

### 🔄 Activity Tracking

- Last seen updated every 30 seconds
- Keeps participant marked as online
- Helps track active users

## 🚀 Testing

### Test Flow

1. **Join a Room**
   ```
   - Open /c/abc123
   - Enter display name: "Test User"
   - Join room
   ```

2. **Verify Session Stored**
   ```
   - Open DevTools → Application → Local Storage
   - Check for key: vaporlink_session_abc123
   - Should contain your participant data
   ```

3. **Test Reload**
   ```
   - Press F5 or Cmd+R
   - Should auto-join without showing join screen
   - Same identity maintained
   ```

4. **Test Leave**
   ```
   - Click Leave/Logout button
   - Check localStorage → Session should be cleared
   - Try reload → Should show join screen again
   ```

## 🔒 Privacy & Security

### What's Stored
- ✅ Participant ID (temporary)
- ✅ Display name (your choice)
- ✅ Avatar URL (public API)
- ✅ Join timestamp

### What's NOT Stored
- ❌ Messages
- ❌ Room password
- ❌ Other participants' data
- ❌ Personal information

### Auto-Cleanup
- Session cleared when room expires (24 hours)
- Session cleared when you leave
- No data persists after room deletion

## 📊 Session Lifecycle

```
┌─────────────┐
│  Page Load  │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ Check localStorage│
└──────┬──────────┘
       │
   ┌───┴───┐
   │       │
   ↓       ↓
[Found] [Not Found]
   │       │
   │       ↓
   │   ┌─────────┐
   │   │Join Form│
   │   └────┬────┘
   │        │
   │        ↓
   │   ┌────────┐
   │   │ Store  │
   │   │Session │
   │   └───┬────┘
   │       │
   ↓       ↓
┌──────────────┐
│Verify Session│
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
   ↓        ↓
[Valid]  [Invalid]
   │        │
   │        ↓
   │   ┌────────┐
   │   │ Clear  │
   │   │Session │
   │   └───┬────┘
   │       │
   │       ↓
   │   ┌─────────┐
   │   │Join Form│
   │   └─────────┘
   │
   ↓
┌──────────┐
│Auto-Join │
└──────────┘
```

## 🐛 Error Handling

### Scenario: Participant Deleted
```javascript
// Session exists but participant removed from DB
verifyAndRestoreSession() → Participant not found
→ Clear localStorage
→ Show join screen
```

### Scenario: Room Expired
```javascript
// Fetch room → 410 Gone
→ Clear localStorage
→ Redirect to home
→ Show "Room Expired" toast
```

### Scenario: Corrupted Data
```javascript
// localStorage has invalid JSON
try {
  JSON.parse(session)
} catch (error) {
  // Clear corrupted data
  localStorage.removeItem(...)
}
```

## 🎨 User Benefits

1. **Seamless Experience**: No re-joining after accidental reload
2. **Identity Preservation**: Same name/avatar throughout session
3. **Multiple Tabs**: Can open same room in multiple tabs (same identity)
4. **Quick Recovery**: Network issues don't require re-entering details

## 🔮 Future Enhancements

Potential improvements:
- [ ] Session expiry (e.g., 24 hours)
- [ ] Multiple device sync (with backend)
- [ ] Restore scroll position
- [ ] Draft message recovery
- [ ] Typing state restoration
- [ ] Notification preferences

---

**Result**: Users now maintain their identity across page reloads, creating a seamless chat experience! 🎉
