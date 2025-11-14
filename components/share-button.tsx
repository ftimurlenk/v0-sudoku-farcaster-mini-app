'use client'

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import sdk from '@farcaster/miniapp-sdk'
import { toast } from 'sonner'

interface ShareButtonProps {
  score: number
  time: number
  difficulty: string
  performance: string
  disabled?: boolean
}

export function ShareButton({ score, time, difficulty, performance, disabled }: ShareButtonProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleShare = async () => {
    try {
      const castText = `Just completed a ${difficulty} Sudoku puzzle!\n\nScore: ${score}\nTime: ${formatTime(time)}\nRating: ${performance}\n\nPlay now on Farcaster!`
      
      const result = await sdk.actions.composeCast({
        text: castText,
        embeds: [window.location.origin],
      })

      if (result?.cast) {
        toast.success('Score shared to Farcaster!')
      }
    } catch (error) {
      console.error('[v0] Error sharing to Farcaster:', error)
      toast.error('Failed to share. Please try again.')
    }
  }

  return (
    <Button
      onClick={handleShare}
      disabled={disabled}
      variant="outline"
      className="gap-2"
    >
      <Share2 className="h-4 w-4" />
      Share to Farcaster
    </Button>
  )
}
