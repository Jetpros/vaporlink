/**
 * In-Memory Data Store for VaporLink
 * All data is stored in memory using Maps and Arrays
 */

import { nanoid } from "nanoid";

// Type Definitions
export interface Room {
  id: string;
  name?: string;
  uniqueId: string;
  password?: string; // bcrypt hashed
  createdAt: Date;
  expiresAt: Date;
  firstJoinAt?: Date;
  creatorId?: string;
  maxUsers: number;
  isDeleted: boolean;
  durationHours: number;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string; // participant id
  content: string;
  type: string; // text, image, video, audio, file, voice
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // duration in seconds for voice/video messages
  mediaWidth?: number; // width in pixels for images/videos
  mediaHeight?: number; // height in pixels for images/videos
  publicId?: string; // Cloudinary public ID for file deletion
  createdAt: Date;
  replyToId?: string;
}

export interface User {
  id: string;
  email?: string;
  emailVerified?: Date;
  name?: string;
  image?: string;
  password?: string; // bcrypt hashed
  provider?: string; // google, email, credentials
  createdAt: Date;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface Participant {
  id: string;
  roomId: string;
  userId?: string; // nullable for anonymous users
  displayName: string;
  avatar: string; // URL or DiceBear seed
  joinedAt: Date;
  lastSeenAt: Date;
  isOnline: boolean;
  socketId?: string;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string; // participant id
  emoji: string;
  createdAt: Date;
}

export interface RateLimit {
  id: string;
  key: string; // IP address or user ID
  count: number;
  resetAt: Date;
  createdAt: Date;
}

export interface Call {
  id: string;
  roomId: string;
  initiatorId: string; // participant who started the call
  startedAt: Date;
  endedAt?: Date;
  status: 'ringing' | 'active' | 'ended';
  dailyRoomUrl?: string; // Daily.co room URL (if using Daily)
}

export interface CallParticipant {
  id: string;
  callId: string;
  participantId: string;
  joinedAt: Date;
  leftAt?: Date;
  status: 'ringing' | 'declined' | 'joined' | 'left';
  isMuted: boolean;
  isVideoEnabled: boolean;
}

// In-Memory Storage
class MemoryStore {
  private rooms = new Map<string, Room>();
  private messages = new Map<string, Message>();
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>();
  private participants = new Map<string, Participant>();
  private reactions = new Map<string, Reaction>();
  private rateLimits = new Map<string, RateLimit>();
  private calls = new Map<string, Call>();
  private callParticipants = new Map<string, CallParticipant>();

  // Room Operations
  createRoom(data: Omit<Room, "id">): Room {
    const room: Room = {
      id: nanoid(),
      ...data,
    };
    this.rooms.set(room.id, room);
    console.log(`✅ Room created: ${room.uniqueId} (ID: ${room.id})`);
    console.log(`📊 Total rooms in memory: ${this.rooms.size}`);
    return room;
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  getRoomByUniqueId(uniqueId: string): Room | undefined {
    const room = Array.from(this.rooms.values()).find(
      (room) => room.uniqueId === uniqueId
    );
    if (room) {
      console.log(`🔍 Room found: ${uniqueId}`);
    } else {
      console.log(`❌ Room NOT found: ${uniqueId}`);
      console.log(
        `📊 Available rooms: ${Array.from(this.rooms.values())
          .map((r) => r.uniqueId)
          .join(", ")}`
      );
    }
    return room;
  }

  updateRoom(id: string, data: Partial<Room>): Room | undefined {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const updated = { ...room, ...data };
    this.rooms.set(id, updated);
    return updated;
  }

  deleteRoom(id: string): boolean {
    // Also delete related data
    this.deleteMessagesByRoomId(id);
    this.deleteParticipantsByRoomId(id);
    return this.rooms.delete(id);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // Message Operations
  createMessage(data: Omit<Message, "id" | "createdAt">): Message {
    const message: Message = {
      id: nanoid(),
      createdAt: new Date(),
      ...data,
    };
    this.messages.set(message.id, message);
    return message;
  }

  getMessageById(id: string): Message | undefined {
    return this.messages.get(id);
  }

  getMessagesByRoomId(roomId: string): Message[] {
    return Array.from(this.messages.values())
      .filter((m) => m.roomId === roomId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  updateMessage(id: string, data: Partial<Message>): Message | undefined {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updated = { ...message, ...data };
    this.messages.set(id, updated);
    return updated;
  }

  deleteMessage(id: string): boolean {
    // Also delete related reactions
    this.deleteReactionsByMessageId(id);
    return this.messages.delete(id);
  }

  deleteMessagesByRoomId(roomId: string): void {
    const messages = this.getMessagesByRoomId(roomId);
    messages.forEach((m) => this.deleteMessage(m.id));
  }

  // User Operations
  createUser(data: Omit<User, "id" | "createdAt">): User {
    const user: User = {
      id: nanoid(),
      createdAt: new Date(),
      ...data,
    };
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  updateUser(id: string, data: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // Session Operations
  createSession(data: Omit<Session, "id">): Session {
    const session: Session = {
      id: nanoid(),
      ...data,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSessionByToken(token: string): Session | undefined {
    return Array.from(this.sessions.values()).find(
      (s) => s.sessionToken === token
    );
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  deleteExpiredSessions(): number {
    const now = new Date();
    let deleted = 0;

    this.sessions.forEach((session, id) => {
      if (session.expires < now) {
        this.sessions.delete(id);
        deleted++;
      }
    });

    return deleted;
  }

  // Participant Operations
  createParticipant(
    data: Omit<Participant, "id" | "joinedAt" | "lastSeenAt">
  ): Participant {
    const participant: Participant = {
      id: nanoid(),
      joinedAt: new Date(),
      lastSeenAt: new Date(),
      ...data,
    };
    this.participants.set(participant.id, participant);
    return participant;
  }

  getParticipantById(id: string): Participant | undefined {
    return this.participants.get(id);
  }

  getParticipantsByRoomId(roomId: string): Participant[] {
    return Array.from(this.participants.values())
      .filter((p) => p.roomId === roomId)
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
  }

  getParticipantByRoomAndUser(
    roomId: string,
    userId?: string
  ): Participant | undefined {
    return Array.from(this.participants.values()).find(
      (p) => p.roomId === roomId && p.userId === userId
    );
  }

  updateParticipant(
    id: string,
    data: Partial<Participant>
  ): Participant | undefined {
    const participant = this.participants.get(id);
    if (!participant) return undefined;

    const updated = { ...participant, ...data };
    this.participants.set(id, updated);
    return updated;
  }

  deleteParticipant(id: string): boolean {
    // Also delete related messages and reactions
    const messages = Array.from(this.messages.values()).filter(
      (m) => m.userId === id
    );
    messages.forEach((m) => this.deleteMessage(m.id));

    const reactions = Array.from(this.reactions.values()).filter(
      (r) => r.userId === id
    );
    reactions.forEach((r) => this.reactions.delete(r.id));

    return this.participants.delete(id);
  }

  deleteParticipantsByRoomId(roomId: string): void {
    const participants = this.getParticipantsByRoomId(roomId);
    participants.forEach((p) => this.deleteParticipant(p.id));
  }

  // Reaction Operations
  createReaction(data: Omit<Reaction, "id" | "createdAt">): Reaction {
    const reaction: Reaction = {
      id: nanoid(),
      createdAt: new Date(),
      ...data,
    };
    this.reactions.set(reaction.id, reaction);
    return reaction;
  }

  getReactionsByMessageId(messageId: string): Reaction[] {
    return Array.from(this.reactions.values())
      .filter((r) => r.messageId === messageId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  getReactionByMessageAndUser(
    messageId: string,
    userId: string
  ): Reaction | undefined {
    return Array.from(this.reactions.values()).find(
      (r) => r.messageId === messageId && r.userId === userId
    );
  }

  deleteReaction(id: string): boolean {
    return this.reactions.delete(id);
  }

  deleteReactionsByMessageId(messageId: string): void {
    const reactions = this.getReactionsByMessageId(messageId);
    reactions.forEach((r) => this.reactions.delete(r.id));
  }

  // Rate Limit Operations
  createRateLimit(key: string, resetAt: Date): RateLimit {
    const rateLimit: RateLimit = {
      id: nanoid(),
      key,
      count: 1,
      resetAt,
      createdAt: new Date(),
    };
    this.rateLimits.set(key, rateLimit);
    return rateLimit;
  }

  getRateLimit(key: string): RateLimit | undefined {
    return this.rateLimits.get(key);
  }

  incrementRateLimit(key: string): RateLimit | undefined {
    const rateLimit = this.rateLimits.get(key);
    if (!rateLimit) return undefined;

    rateLimit.count++;
    this.rateLimits.set(key, rateLimit);
    return rateLimit;
  }

  deleteRateLimit(key: string): boolean {
    return this.rateLimits.delete(key);
  }

  deleteExpiredRateLimits(): number {
    const now = new Date();
    let deleted = 0;

    this.rateLimits.forEach((rateLimit, key) => {
      if (rateLimit.resetAt < now) {
        this.rateLimits.delete(key);
        deleted++;
      }
    });

    return deleted;
  }

  // Call Operations
  createCall(data: Omit<Call, "id" | "startedAt">): Call {
    const call: Call = {
      id: nanoid(),
      startedAt: new Date(),
      ...data,
    };
    this.calls.set(call.id, call);
    console.log(`📞 Call created: ${call.id} in room ${call.roomId}`);
    return call;
  }

  getCallById(id: string): Call | undefined {
    return this.calls.get(id);
  }

  getActiveCallByRoomId(roomId: string): Call | undefined {
    return Array.from(this.calls.values()).find(
      (call) => call.roomId === roomId && call.status !== 'ended'
    );
  }

  getAllCallsByRoomId(roomId: string): Call[] {
    return Array.from(this.calls.values())
      .filter((call) => call.roomId === roomId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  updateCall(id: string, data: Partial<Call>): Call | undefined {
    const call = this.calls.get(id);
    if (!call) return undefined;

    const updated = { ...call, ...data };
    this.calls.set(id, updated);
    return updated;
  }

  deleteCall(id: string): boolean {
    // Also delete related call participants
    this.deleteCallParticipantsByCallId(id);
    return this.calls.delete(id);
  }

  // Call Participant Operations
  createCallParticipant(
    data: Omit<CallParticipant, "id" | "joinedAt">
  ): CallParticipant {
    const callParticipant: CallParticipant = {
      id: nanoid(),
      joinedAt: new Date(),
      ...data,
    };
    this.callParticipants.set(callParticipant.id, callParticipant);
    console.log(
      `📞 Call participant created: ${callParticipant.participantId} in call ${callParticipant.callId}`
    );
    return callParticipant;
  }

  getCallParticipantById(id: string): CallParticipant | undefined {
    return this.callParticipants.get(id);
  }

  getCallParticipantsByCallId(callId: string): CallParticipant[] {
    return Array.from(this.callParticipants.values())
      .filter((cp) => cp.callId === callId)
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
  }

  getCallParticipantByCallAndParticipant(
    callId: string,
    participantId: string
  ): CallParticipant | undefined {
    return Array.from(this.callParticipants.values()).find(
      (cp) => cp.callId === callId && cp.participantId === participantId
    );
  }

  updateCallParticipant(
    id: string,
    data: Partial<CallParticipant>
  ): CallParticipant | undefined {
    const callParticipant = this.callParticipants.get(id);
    if (!callParticipant) return undefined;

    const updated = { ...callParticipant, ...data };
    this.callParticipants.set(id, updated);
    return updated;
  }

  deleteCallParticipant(id: string): boolean {
    return this.callParticipants.delete(id);
  }

  deleteCallParticipantsByCallId(callId: string): void {
    const callParticipants = this.getCallParticipantsByCallId(callId);
    callParticipants.forEach((cp) => this.callParticipants.delete(cp.id));
  }

  // Cleanup Operations
  cleanupExpiredRooms(): number {
    const now = new Date();
    let deleted = 0;

    this.rooms.forEach((room, id) => {
      if (room.expiresAt < now || room.isDeleted) {
        this.deleteRoom(id);
        deleted++;
      }
    });

    return deleted;
  }

  // Utility Operations
  getStats() {
    return {
      rooms: this.rooms.size,
      messages: this.messages.size,
      users: this.users.size,
      sessions: this.sessions.size,
      participants: this.participants.size,
      reactions: this.reactions.size,
      rateLimits: this.rateLimits.size,
      calls: this.calls.size,
      callParticipants: this.callParticipants.size,
    };
  }

  clearAll() {
    this.rooms.clear();
    this.messages.clear();
    this.users.clear();
    this.sessions.clear();
    this.participants.clear();
    this.reactions.clear();
    this.rateLimits.clear();
    this.calls.clear();
    this.callParticipants.clear();
  }
}

// Declare global type for Node.js global object
declare global {
  var __vaporlink_memoryStore: MemoryStore | undefined;
  var __vaporlink_cleanupInterval: NodeJS.Timeout | undefined;
  var __vaporlink_initialized: boolean | undefined;
}

// Get or create singleton instance
function getMemoryStore(): MemoryStore {
  // Client-side: create a temporary instance (shouldn't happen in practice)
  if (typeof window !== "undefined") {
    return new MemoryStore();
  }

  // Server-side: use or create global instance
  if (!globalThis.__vaporlink_memoryStore) {
    console.log("💾 🆕 Creating Memory Store singleton instance");
    globalThis.__vaporlink_memoryStore = new MemoryStore();
    globalThis.__vaporlink_initialized = true;

    // Set up cleanup interval only once
    if (!globalThis.__vaporlink_cleanupInterval) {
      globalThis.__vaporlink_cleanupInterval = setInterval(() => {
        if (globalThis.__vaporlink_memoryStore) {
          const deletedRooms =
            globalThis.__vaporlink_memoryStore.cleanupExpiredRooms();
          const deletedSessions =
            globalThis.__vaporlink_memoryStore.deleteExpiredSessions();
          const deletedRateLimits =
            globalThis.__vaporlink_memoryStore.deleteExpiredRateLimits();

          if (
            deletedRooms > 0 ||
            deletedSessions > 0 ||
            deletedRateLimits > 0
          ) {
            console.log(
              `🧹 Auto-cleanup: ${deletedRooms} rooms, ${deletedSessions} sessions, ${deletedRateLimits} rate limits`
            );
          }
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
  }

  return globalThis.__vaporlink_memoryStore;
}

// Export singleton instance via function call
export const memoryStore = getMemoryStore();
