'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Edit3 } from 'lucide-react'

interface NumericKeyboardProps {
  onNumberSelect: (num: number) => void
  onClear: () => void
  notesMode: boolean
  onNotesToggle: () => void
  disabled?: boolean
}

export function NumericKeyboard({ 
  onNumberSelect, 
  onClear, 
  notesMode,
  onNotesToggle,
  disabled 
}: NumericKeyboardProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="mx-auto w-full max-w-md space-y-2">
      <div className="flex justify-center">
        <Button
          onClick={onNotesToggle}
          disabled={disabled}
          variant={notesMode ? "default" : "outline"}
          size="sm"
          className={cn(
            'h-8 px-4 text-xs font-medium gap-1.5',
            notesMode && 'bg-chart-1 hover:bg-chart-1/90'
          )}
        >
          <Edit3 className="h-3.5 w-3.5" />
          {notesMode ? 'Notes Mode ON' : 'Notes Mode OFF'}
        </Button>
      </div>
      
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
        {numbers.map((num) => (
          <Button
            key={num}
            onClick={() => onNumberSelect(num)}
            disabled={disabled}
            variant="ghost"
            size="sm"
            className={cn(
              'h-11 w-full rounded-md p-0 text-base font-medium sm:h-12 sm:text-lg',
              'border border-border/30',
              notesMode 
                ? 'hover:border-chart-2/50 hover:bg-chart-2/5 hover:text-chart-2'
                : 'hover:border-chart-1/50 hover:bg-chart-1/5 hover:text-chart-1',
              'active:scale-95 transition-all duration-150',
              disabled && 'opacity-30 cursor-not-allowed'
            )}
          >
            {num}
          </Button>
        ))}
      </div>
      <div className="flex justify-center">
        <Button
          onClick={onClear}
          disabled={disabled}
          variant="ghost"
          size="sm"
          className={cn(
            'h-9 px-8 text-sm font-medium text-muted-foreground',
            'hover:text-foreground hover:bg-accent',
            'transition-colors duration-150',
            disabled && 'opacity-30 cursor-not-allowed'
          )}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
