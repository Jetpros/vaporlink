interface TypingIndicatorProps {
  users: string[]
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const displayText =
    users.length === 1
      ? `${users[0]} is typing...`
      : users.length === 2
      ? `${users[0]} and ${users[1]} are typing...`
      : `${users[0]} and ${users.length - 1} others are typing...`

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3">
        <div className="flex items-center space-x-1">
          <div className="typing-dot w-2 h-2 bg-indigo-500 rounded-full" />
          <div className="typing-dot w-2 h-2 bg-indigo-500 rounded-full" />
          <div className="typing-dot w-2 h-2 bg-indigo-500 rounded-full" />
        </div>
      </div>
      <p className="text-sm text-gray-500">{displayText}</p>
    </div>
  )
}
