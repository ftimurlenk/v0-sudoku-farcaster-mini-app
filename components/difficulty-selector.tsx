'use client'

import { Button } from '@/components/ui/button'
import { type Difficulty } from '@/lib/sudoku-generator'
import { cn } from '@/lib/utils'

interface DifficultySelectorProps {
  currentDifficulty: Difficulty
  onSelectDifficulty: (difficulty: Difficulty) => void
  disabled: boolean
}

export function DifficultySelector({
  currentDifficulty,
  onSelectDifficulty,
  disabled,
}: DifficultySelectorProps) {
  const difficulties: { level: Difficulty; label: string; description: string }[] = [
    { level: 'easy', label: 'Easy', description: '46 clues' },
    { level: 'medium', label: 'Medium', description: '36 clues' },
    { level: 'hard', label: 'Hard', description: '29 clues' },
  ]

  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-3 sm:text-sm">
        Difficulty Level
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {difficulties.map(({ level, label, description }) => (
          <Button
            key={level}
            onClick={() => onSelectDifficulty(level)}
            disabled={disabled}
            variant={currentDifficulty === level ? 'default' : 'outline'}
            className={cn(
              'flex h-auto flex-col items-center gap-0.5 py-2.5 text-sm sm:gap-1 sm:py-3 sm:text-base',
              currentDifficulty === level && 'bg-chart-1 hover:bg-chart-1/90'
            )}
          >
            <span className="font-bold">{label}</span>
            <span className="text-xs opacity-80">{description}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
