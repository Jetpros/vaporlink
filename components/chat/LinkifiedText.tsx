'use client'

import { extractLinks } from '@/lib/linkUtils'

interface LinkifiedTextProps {
  text: string
  className?: string
}

export default function LinkifiedText({ text, className = '' }: LinkifiedTextProps) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
