'use client'

import { cn } from '@/lib/utils'

interface SudokuBoardProps {
  puzzle: number[][]
  userBoard: number[][]
  solution: number[][]
  notes: Set<number>[][]
  onCellChange: (row: number, col: number, value: number) => void
  isComplete: boolean
  selectedCell: { row: number; col: number } | null
  onCellSelect: (cell: { row: number; col: number } | null) => void
}

export function SudokuBoard({ 
  puzzle, 
  userBoard,
  solution,
  notes,
  onCellChange, 
  isComplete,
  selectedCell,
  onCellSelect
}: SudokuBoardProps) {
  const isBoardFull = userBoard.every(row => row.every(cell => cell !== 0))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    const value = e.target.value
    if (value === '') {
      onCellChange(row, col, 0)
    } else {
      const numValue = parseInt(value)
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 9) {
        onCellChange(row, col, numValue)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    const value = parseInt(e.key)
    if (value >= 1 && value <= 9) {
      onCellChange(row, col, value)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      onCellChange(row, col, 0)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, row: number, col: number) => {
    const isInitial = puzzle[row][col] !== 0
    if (!isInitial && !isComplete) {
      onCellSelect({ row, col })
    }
  }

  return (
    <div className="mx-auto inline-block rounded-lg bg-card p-1.5 shadow-lg sm:p-2 md:p-4 animate-fade-in">
      <div className="grid grid-cols-9 gap-0">
        {userBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isInitial = puzzle[rowIndex][colIndex] !== 0
            const isThickTop = rowIndex % 3 === 0
            const isThickLeft = colIndex % 3 === 0
            const isThickBottom = rowIndex === 8
            const isThickRight = colIndex === 8
            const isSelected = 
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex
            const isCorrect = !isInitial && 
                            cell !== 0 && 
                            cell === solution[rowIndex][colIndex]
            const hasError = !isInitial && 
                           isBoardFull && 
                           !isComplete && 
                           cell !== 0 && 
                           cell !== solution[rowIndex][colIndex]
            const cellNotes = notes[rowIndex]?.[colIndex]
            const hasNotes = cellNotes && cellNotes.size > 0 && cell === 0

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  'relative',
                  isThickTop && 'border-t-2 border-t-border',
                  isThickLeft && 'border-l-2 border-l-border',
                  isThickBottom && 'border-b-2 border-b-border',
                  isThickRight && 'border-r-2 border-r-border',
                  !isThickTop && 'border-t border-t-border/50',
                  !isThickLeft && 'border-l border-l-border/50',
                  !isThickBottom && 'border-b border-b-border/50',
                  !isThickRight && 'border-r border-r-border/50'
                )}
                onClick={(e) => handleClick(e, rowIndex, colIndex)}
              >
                {hasNotes ? (
                  <div className={cn(
                    'h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 cursor-pointer transition-all duration-200',
                    'grid grid-cols-3 grid-rows-3 gap-0 p-0.5',
                    !isInitial && 'bg-background hover:bg-accent',
                    isSelected && !isComplete && 'ring-1 ring-primary/40 bg-accent/50'
                  )}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <div 
                        key={num} 
                        className="flex items-center justify-center text-[6px] sm:text-[7px] md:text-[8px] font-medium text-muted-foreground"
                      >
                        {cellNotes.has(num) ? num : ''}
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cell === 0 ? '' : cell}
                    onChange={(e) => handleChange(e, rowIndex, colIndex)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    readOnly={isInitial || isComplete}
                    className={cn(
                      'sudoku-cell h-9 w-9 text-center text-base font-semibold outline-none sm:h-10 sm:w-10 sm:text-lg md:h-12 md:w-12 md:text-xl',
                      isInitial
                        ? 'bg-muted text-foreground cursor-default'
                        : 'bg-background text-chart-1 cursor-pointer hover:bg-accent active:bg-accent',
                      !isInitial && 'focus:bg-accent focus:ring-1 focus:ring-primary/40',
                      isComplete && 'bg-chart-1/10 text-chart-1',
                      isSelected && !isComplete && 'ring-1 ring-primary/40 bg-accent/50',
                      isCorrect && !isComplete && 'text-green-600 bg-green-50',
                      hasError && 'bg-red-500/20 text-red-500 ring-2 ring-red-500 animate-shake'
                    )}
                    maxLength={1}
                  />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
