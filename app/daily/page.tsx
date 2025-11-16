'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import sdk from '@farcaster/miniapp-sdk'
import { SudokuBoard } from '@/components/sudoku-board'
import { GameControls } from '@/components/game-controls'
import { NumericKeyboard } from '@/components/numeric-keyboard'
import { WalletConnect } from '@/components/wallet-connect'
import { ScoreDisplay } from '@/components/score-display'
import { SaveScoreDialog } from '@/components/save-score-dialog'
import { validateSolution, type Difficulty } from '@/lib/sudoku-generator'
import {
  generateDailyChallenge,
  getDailyChallengeDifficulty,
  formatChallengeDate,
  getTimeUntilNextChallenge,
} from '@/lib/daily-challenge'
import {
  SUDOKU_SCORE_ABI,
  SUDOKU_SCORE_CONTRACT_ADDRESS,
  DIFFICULTY_ENUM,
  calculateScore,
  getPerformanceRating,
} from '@/lib/score-contract'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Move = {
  row: number
  col: number
  previousValue: number
  newValue: number
}

export default function DailyChallengePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [puzzle, setPuzzle] = useState<number[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [userBoard, setUserBoard] = useState<number[][]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [finalScore, setFinalScore] = useState<number>(0)
  const [scoreSaved, setScoreSaved] = useState(false)
  const [hintsRemaining, setHintsRemaining] = useState<number>(5)
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [redoStack, setRedoStack] = useState<Move[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [pausedTime, setPausedTime] = useState<number>(0)
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 })

  const { address, isConnected } = useAccount()
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    sdk.actions.ready()
    loadDailyChallenge()
  }, [])

  useEffect(() => {
    if (!isComplete && startTime > 0 && !isPaused) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime - pausedTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isComplete, startTime, isPaused, pausedTime])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNext(getTimeUntilNextChallenge())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isConfirmed) {
      setScoreSaved(true)
      toast.success('Score saved to Base Network!')
    }
  }, [isConfirmed])

  const loadDailyChallenge = () => {
    setIsLoading(true)
    const { puzzle: newPuzzle, solution: newSolution } = generateDailyChallenge()
    const level = getDailyChallengeDifficulty()
    
    setPuzzle(newPuzzle)
    setSolution(newSolution)
    setUserBoard(newPuzzle.map((row) => [...row]))
    setDifficulty(level)
    setIsLoading(false)
    setStartTime(Date.now())
    setElapsedTime(0)
    setHintsRemaining(5)
    setMoveHistory([])
    setRedoStack([])
    setIsPaused(false)
    setPausedTime(0)
    setIsComplete(false)
    setScoreSaved(false)
  }

  const handleCellChange = (row: number, col: number, value: number) => {
    if (puzzle[row][col] !== 0 || isPaused) return

    const previousValue = userBoard[row][col]
    
    if (previousValue !== value) {
      setMoveHistory(prev => [...prev, { row, col, previousValue, newValue: value }])
      setRedoStack([])
    }

    const newBoard = userBoard.map((r) => [...r])
    newBoard[row][col] = value
    setUserBoard(newBoard)

    const isBoardFull = newBoard.every(row => row.every(cell => cell !== 0))
    
    if (validateSolution(newBoard, solution)) {
      const finalTime = Math.floor((Date.now() - startTime - pausedTime) / 1000)
      const score = calculateScore(finalTime, difficulty)
      setElapsedTime(finalTime)
      setFinalScore(score)
      setIsComplete(true)
      setShowScoreDialog(true)
    } else if (isBoardFull) {
      toast.error('There are mistakes in your solution. Check the red cells.')
    }
  }

  const handleNumberSelect = (num: number) => {
    if (selectedCell && !isPaused) {
      handleCellChange(selectedCell.row, selectedCell.col, num)
    }
  }

  const handleClear = () => {
    if (selectedCell && !isPaused) {
      handleCellChange(selectedCell.row, selectedCell.col, 0)
    }
  }

  const handleReset = () => {
    setUserBoard(puzzle.map((row) => [...row]))
    setIsComplete(false)
    setSelectedCell(null)
    setStartTime(Date.now())
    setElapsedTime(0)
    setHintsRemaining(5)
    setMoveHistory([])
    setRedoStack([])
    setPausedTime(0)
  }

  const handleUndo = () => {
    if (moveHistory.length === 0) return

    const lastMove = moveHistory[moveHistory.length - 1]
    const newBoard = userBoard.map((r) => [...r])
    newBoard[lastMove.row][lastMove.col] = lastMove.previousValue
    setUserBoard(newBoard)
    
    setRedoStack(prev => [...prev, lastMove])
    setMoveHistory(prev => prev.slice(0, -1))
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return

    const moveToRedo = redoStack[redoStack.length - 1]
    const newBoard = userBoard.map((r) => [...r])
    newBoard[moveToRedo.row][moveToRedo.col] = moveToRedo.newValue
    setUserBoard(newBoard)
    
    setMoveHistory(prev => [...prev, moveToRedo])
    setRedoStack(prev => prev.slice(0, -1))
  }

  const handlePauseToggle = () => {
    if (isPaused) {
      const pauseDuration = Date.now() - (startTime + elapsedTime * 1000 + pausedTime)
      setPausedTime(prev => prev + pauseDuration)
      setIsPaused(false)
    } else {
      setIsPaused(true)
    }
  }

  const handleHint = () => {
    if (hintsRemaining <= 0) {
      toast.error('No hints remaining!')
      return
    }

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (userBoard[row][col] === 0) {
          const newBoard = userBoard.map((r) => [...r])
          newBoard[row][col] = solution[row][col]
          setUserBoard(newBoard)
          setHintsRemaining(prev => prev - 1)
          toast.success(`Hint used! ${hintsRemaining - 1} hints remaining`)
          return
        }
      }
    }
  }

  const handleSaveScore = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      writeContract({
        address: SUDOKU_SCORE_CONTRACT_ADDRESS,
        abi: SUDOKU_SCORE_ABI,
        functionName: 'saveScore',
        args: [DIFFICULTY_ENUM[difficulty], BigInt(elapsedTime), BigInt(finalScore)],
      })
      toast.info('Saving score to Base Network...')
    } catch (error) {
      console.error('[v0] Error saving score:', error)
      toast.error('Failed to save score')
    }
  }

  const handleNewGameFromDialog = () => {
    setShowScoreDialog(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading Daily Challenge...</div>
        </div>
      </div>
    )
  }

  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-600 border-red-500/20',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        <header className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <WalletConnect />
        </header>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Daily Challenge</h2>
                </div>
                <p className="text-sm text-muted-foreground">{formatChallengeDate()}</p>
              </div>
              <Badge variant="outline" className={difficultyColors[difficulty]}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
            </div>
            {!isComplete && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Next challenge in {timeUntilNext.hours}h {timeUntilNext.minutes}m {timeUntilNext.seconds}s
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {!isComplete && startTime > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-xl font-bold tabular-nums min-w-[60px]">
                      {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className="text-xl font-bold tabular-nums text-chart-1 min-w-[70px]">
                      {calculateScore(elapsedTime, difficulty).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="relative flex justify-center">
          <SudokuBoard
            puzzle={puzzle}
            userBoard={userBoard}
            solution={solution}
            notes={[]}
            onCellChange={handleCellChange}
            isComplete={isComplete}
            selectedCell={selectedCell}
            onCellSelect={setSelectedCell}
          />
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold">Game Paused</div>
                <p className="text-muted-foreground">Click Resume to continue</p>
              </div>
            </div>
          )}
        </div>

        <NumericKeyboard
          onNumberSelect={handleNumberSelect}
          onClear={handleClear}
          disabled={isComplete || selectedCell === null || isPaused}
        />

        <GameControls
          onReset={handleReset}
          onHint={handleHint}
          onNewGame={loadDailyChallenge}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onPauseToggle={handlePauseToggle}
          isComplete={isComplete}
          isPaused={isPaused}
          hintsRemaining={hintsRemaining}
          canUndo={moveHistory.length > 0}
          canRedo={redoStack.length > 0}
        />
        
        <SaveScoreDialog
          open={showScoreDialog}
          onOpenChange={setShowScoreDialog}
          score={finalScore}
          time={elapsedTime}
          difficulty={difficulty}
          performance={getPerformanceRating(finalScore, difficulty)}
          onSaveScore={handleSaveScore}
          onNewGame={handleNewGameFromDialog}
          isConnected={isConnected}
          isSaving={isConfirming}
          scoreSaved={scoreSaved}
        />
      </div>
    </div>
  )
}
