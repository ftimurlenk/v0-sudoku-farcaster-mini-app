'use client'

import { Clock, Trophy, Zap } from 'lucide-react'
import { getPerformanceRating } from '@/lib/score-contract'

interface ScoreDisplayProps {
  time: number
  score: number
  difficulty: 'easy' | 'medium' | 'hard'
  showPerformance?: boolean
}

export function ScoreDisplay({ time, score, difficulty, showPerformance = false }: ScoreDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const performance = getPerformanceRating(score, difficulty)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-3 rounded-lg border bg-card p-3 text-card-foreground sm:gap-6 sm:p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Time</div>
            <div className="text-lg font-bold sm:text-xl">{formatTime(time)}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <div className="text-xs text-muted-foreground">Score</div>
            <div className="text-lg font-bold sm:text-xl">{score.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      {showPerformance && (
        <div className={`flex items-center justify-center gap-2 rounded-lg border bg-card p-2 ${performance.color}`}>
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">
            {performance.emoji} {performance.rating}
          </span>
        </div>
      )}
    </div>
  )
}
