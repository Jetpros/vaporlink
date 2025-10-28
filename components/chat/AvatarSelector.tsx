'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Shuffle } from 'lucide-react'
import { generateRandomAvatar, AVATAR_STYLES, AvatarStyle } from '@/lib/avatars'

interface AvatarSelectorProps {
  avatar: string
  onAvatarChange: (url: string) => void
}

export default function AvatarSelector({ avatar, onAvatarChange }: AvatarSelectorProps) {
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('avataaars')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRandomize = () => {
    const newAvatar = generateRandomAvatar(avatarStyle)
    onAvatarChange(newAvatar)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        onAvatarChange(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStyleChange = (style: AvatarStyle) => {
    setAvatarStyle(style)
    // Generate new avatar with the selected style
    const newAvatar = generateRandomAvatar(style)
    onAvatarChange(newAvatar)
  }

  return (
    <div className="space-y-4">
      <Label>Your Avatar</Label>
      
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20 border-2 border-indigo-200">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-indigo-100 text-indigo-700">?</AvatarFallback>
        </Avatar>

        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRandomize}
            className="border-gray-300 hover:bg-gray-100"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Randomize
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="border-gray-300 hover:bg-gray-100"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar-style" className="text-sm text-gray-600">
          Avatar Style
        </Label>
        <Select value={avatarStyle} onValueChange={handleStyleChange}>
          <SelectTrigger id="avatar-style" className="border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVATAR_STYLES.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
