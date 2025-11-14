'use client'

import { Button } from '@/components/ui/button'
import { RotateCcw, Lightbulb, Plus, Undo, Redo, Pause, Play } from 'lucide-react'

interface GameControlsProps {
  onReset: () => void
  onHint: () => void
  onNewGame: () => void
  onUndo: () => void
  onRedo: () => void
  onPauseToggle: () => void
  isComplete: boolean
  isPaused: boolean
  hintsRemaining: number
  canUndo: boolean
  canRedo: boolean
}

export function GameControls({ 
  onReset, 
  onHint, 
  onNewGame, 
  onUndo,
  onRedo,
  onPauseToggle,
  isComplete,
  isPaused,
  hintsRemaining,
  canUndo,
  canRedo
}: GameControlsProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Button 
          onClick={onUndo} 
          variant="ghost" 
          disabled={isComplete || !canUndo || isPaused}
          className="flex items-center justify-center gap-1.5"
        >
          <Undo className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Undo</span>
        </Button>
        <Button 
          onClick={onPauseToggle} 
          variant="ghost"
          disabled={isComplete}
          className="flex items-center justify-center gap-1.5"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span className="text-xs sm:text-sm">{isPaused ? 'Resume' : 'Pause'}</span>
        </Button>
        <Button 
          onClick={onRedo} 
          variant="ghost" 
          disabled={isComplete || !canRedo || isPaused}
          className="flex items-center justify-center gap-1.5"
        >
          <Redo className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Redo</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Button 
          onClick={onReset} 
          variant="outline" 
          disabled={isComplete || isPaused} 
          className="flex flex-col items-center gap-1 py-3 sm:flex-row sm:gap-2 sm:py-2"
        >
          <RotateCcw className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Reset</span>
        </Button>
        <Button 
          onClick={onHint} 
          variant="outline" 
          disabled={isComplete || hintsRemaining <= 0 || isPaused}
          className="relative flex flex-col items-center gap-1 py-3 sm:flex-row sm:gap-2 sm:py-2"
        >
          <Lightbulb className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Hint ({hintsRemaining})</span>
        </Button>
        <Button 
          onClick={onNewGame} 
          className="flex flex-col items-center gap-1 bg-chart-1 py-3 hover:bg-chart-1/90 sm:flex-row sm:gap-2 sm:py-2"
        >
          <Plus className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">New Game</span>
        </Button>
      </div>
    </div>
  )
}
