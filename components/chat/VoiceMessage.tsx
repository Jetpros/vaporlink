'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'

interface VoiceMessageProps {
  audioUrl: string
  duration: number
  isOwn?: boolean
}

export default function VoiceMessage({ audioUrl, duration, isOwn = false }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', () => {})
      audio.removeEventListener('ended', () => {})
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Generate static waveform bars
  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.sin(i * 0.5) * 0.5 + 0.5
    return height * 0.6 + 0.2 // Range from 0.2 to 0.8
  })

  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div className="flex items-center space-x-3 min-w-[240px]">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        className={`rounded-full h-10 w-10 ${
          isOwn 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </Button>

      <div className="flex-1 flex items-center space-x-2">
        <div className="flex items-center space-x-0.5 h-8 flex-1">
          {waveformBars.map((height, index) => {
            const barProgress = index / waveformBars.length
            const isActive = barProgress <= progress
            
            return (
              <div
                key={index}
                className={`rounded-full transition-all ${
                  isOwn
                    ? isActive
                      ? 'bg-white'
                      : 'bg-white/40'
                    : isActive
                    ? 'bg-indigo-600'
                    : 'bg-indigo-200'
                }`}
                style={{
                  width: '2px',
                  height: `${height * 100}%`,
                }}
              />
            )
          })}
        </div>
        
        <span className={`text-xs min-w-[35px] ${isOwn ? 'text-white/80' : 'text-gray-600'}`}>
          {formatTime(isPlaying ? currentTime : duration)}
        </span>
      </div>
    </div>
  )
}
