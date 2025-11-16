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
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Button 
          onClick={onUndo} 
          variant="outline" 
          disabled={isComplete || !canUndo || isPaused}
          className="flex items-center justify-center gap-2 h-11"
        >
          <Undo className="h-4 w-4" />
          <span className="text-sm font-medium">Undo</span>
        </Button>
        <Button 
          onClick={onPauseToggle} 
          variant="outline"
          disabled={isComplete}
          className="flex items-center justify-center gap-2 h-11"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span className="text-sm font-medium">{isPaused ? 'Resume' : 'Pause'}</span>
        </Button>
        <Button 
          onClick={onRedo} 
          variant="outline" 
          disabled={isComplete || !canRedo || isPaused}
          className="flex items-center justify-center gap-2 h-11"
        >
          <Redo className="h-4 w-4" />
          <span className="text-sm font-medium">Redo</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button 
          onClick={onReset} 
          variant="outline" 
          disabled={isComplete || isPaused} 
          className="flex items-center justify-center gap-2 h-11"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm font-medium">Reset</span>
        </Button>
        <Button 
          onClick={onHint} 
          variant="outline" 
          disabled={isComplete || hintsRemaining <= 0 || isPaused}
          className="flex items-center justify-center gap-2 h-11"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm font-medium">Hint ({hintsRemaining})</span>
        </Button>
        <Button 
          onClick={onNewGame} 
          className="flex items-center justify-center gap-2 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">New Game</span>
        </Button>
      </div>
    </div>
  )
}
