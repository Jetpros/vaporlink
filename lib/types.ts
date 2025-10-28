export interface Room {
  id: string
  name: string | null
  uniqueId: string
  password: string | null
  createdAt: Date
  expiresAt: Date
  firstJoinAt: Date | null
  creatorId: string | null
  maxUsers: number
}

export interface Message {
  id: string
  roomId: string
  userId: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file'
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  createdAt: Date
  replyToId: string | null
  user: Participant
  reactions?: Reaction[]
}

export interface Participant {
  id: string
  roomId: string
  userId: string | null
  displayName: string
  avatar: string
  joinedAt: Date
  lastSeenAt: Date
  isOnline: boolean
  socketId?: string | null
}

export interface Reaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: Date
}

export interface CreateRoomInput {
  name?: string
  password?: string
}

export interface JoinRoomInput {
  roomId: string
  displayName?: string
  avatar?: string
  password?: string
}

export interface SendMessageInput {
  roomId: string
  participantId: string
  content: string
  type?: 'text' | 'image' | 'video' | 'audio' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyToId?: string
}

export interface SocketEvents {
  // Client -> Server
  'join-room': (data: { roomId: string; participantId: string }) => void
  'leave-room': (data: { roomId: string; participantId: string }) => void
  'send-message': (message: SendMessageInput) => void
  'typing-start': (data: { roomId: string; participantId: string }) => void
  'typing-stop': (data: { roomId: string; participantId: string }) => void
  'add-reaction': (data: { messageId: string; emoji: string; userId: string }) => void

  // Server -> Client
  'user-joined': (participant: Participant) => void
  'user-left': (participantId: string) => void
  'new-message': (message: Message) => void
  'user-typing': (data: { participantId: string; displayName: string }) => void
  'user-stopped-typing': (participantId: string) => void
  'reaction-added': (data: { messageId: string; reaction: Reaction }) => void
  'participants-update': (participants: Participant[]) => void
  'room-expired': () => void
}
