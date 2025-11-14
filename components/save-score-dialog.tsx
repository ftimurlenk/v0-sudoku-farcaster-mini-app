'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/share-button'
import { Trophy, Zap } from 'lucide-react'

interface SaveScoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  score: number
  time: number
  difficulty: string
  performance: {
    rating: string
    emoji: string
    color: string
  }
  onSaveScore: () => void
  onNewGame: () => void
  isConnected: boolean
  isSaving: boolean
  scoreSaved: boolean
}

export function SaveScoreDialog({
  open,
  onOpenChange,
  score,
  time,
  difficulty,
  performance,
  onSaveScore,
  onNewGame,
  isConnected,
  isSaving,
  scoreSaved,
}: SaveScoreDialogProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500 animate-celebrate" />
            Congratulations!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You solved the puzzle!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-center text-white animate-pulse">
            <div className="mb-2 text-sm font-medium">Your Score</div>
            <div className="text-4xl font-bold">{score.toLocaleString()}</div>
          </div>

          <div className="flex items-center justify-center gap-4 rounded-lg border bg-card p-3 animate-fade-in">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="text-xl font-bold">{formatTime(time)}</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Performance</div>
              <div className="flex items-center gap-1 text-lg font-bold">
                {performance.emoji} {performance.rating}
              </div>
            </div>
          </div>

          {scoreSaved && (
            <div className="rounded-lg border border-green-500 bg-green-500/10 p-3 text-center text-sm text-green-500 animate-fade-in">
              Score saved to Base Network successfully!
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <ShareButton 
            score={score} 
            time={time} 
            difficulty={difficulty}
            performance={performance.rating}
          />
          
          {isConnected && !scoreSaved && (
            <Button onClick={onSaveScore} disabled={isSaving} className="w-full transition-all duration-200">
              {isSaving ? 'Saving to Base Network...' : 'Save Score to Base Network'}
            </Button>
          )}
          
          {!isConnected && (
            <p className="text-center text-sm text-muted-foreground">
              Connect your wallet to save score onchain
            </p>
          )}
          
          <Button onClick={onNewGame} variant="outline" className="w-full transition-all duration-200">
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
