'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import sdk from '@farcaster/miniapp-sdk'
import { SudokuBoard } from '@/components/sudoku-board'
import { DifficultySelector } from '@/components/difficulty-selector'
import { GameControls } from '@/components/game-controls'
import { NumericKeyboard } from '@/components/numeric-keyboard'
import { WalletConnect } from '@/components/wallet-connect'
import { ScoreDisplay } from '@/components/score-display'
import { SaveScoreDialog } from '@/components/save-score-dialog'
import { Tutorial, TutorialButton } from '@/components/tutorial'
import { AddToAppsDialog } from '@/components/add-to-apps-dialog'
import { generatePuzzle, validateSolution, type Difficulty } from '@/lib/sudoku-generator'
import {
  SUDOKU_SCORE_ABI,
  SUDOKU_SCORE_CONTRACT_ADDRESS,
  DIFFICULTY_ENUM,
  calculateScore,
  getPerformanceRating,
} from '@/lib/score-contract'
import { loadStats, saveStats, updateStats } from '@/lib/achievements'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, Calendar, BarChart3 } from 'lucide-react'

type Move = {
  row: number
  col: number
  previousValue: number
  newValue: number
}

export default function SudokuGame() {
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
  const [notesMode, setNotesMode] = useState(false)
  const [notes, setNotes] = useState<Set<number>[][]>([])
  const [initialHints, setInitialHints] = useState<number>(5)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameId, setGameId] = useState<string>('')

  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    sdk.actions.ready()
    startNewGame('easy')
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
    if (isConfirmed) {
      setScoreSaved(true)
      toast.success('Score saved to Base Network!')
    }
  }, [isConfirmed])

  useEffect(() => {
    if (writeError) {
      console.error('[v0] Write contract error:', writeError)
      toast.error(`Transaction failed: ${writeError.message}`)
    }
  }, [writeError])

  const startNewGame = (level: Difficulty) => {
    setIsLoading(true)
    setIsComplete(false)
    setScoreSaved(false)
    const { puzzle: newPuzzle, solution: newSolution } = generatePuzzle(level)
    setPuzzle(newPuzzle)
    setSolution(newSolution)
    setUserBoard(newPuzzle.map((row) => [...row]))
    setDifficulty(level)
    setIsLoading(false)
    setStartTime(0)
    setElapsedTime(0)
    setHintsRemaining(5)
    setInitialHints(5)
    setMoveHistory([])
    setRedoStack([])
    setIsPaused(false)
    setPausedTime(0)
    setNotes(Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>())))
    setNotesMode(false)
    setGameStarted(false)
    setGameId(`game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }

  const handleStartGame = () => {
    setGameStarted(true)
    setStartTime(Date.now())
  }

  const handleCellChange = (row: number, col: number, value: number) => {
    if (puzzle[row][col] !== 0 || isPaused) return

    if (!gameStarted) {
      handleStartGame()
    }

    const previousValue = userBoard[row][col]
    
    if (previousValue !== value) {
      setMoveHistory(prev => [...prev, { row, col, previousValue, newValue: value }])
      setRedoStack([])
    }

    const newBoard = userBoard.map((r) => [...r])
    newBoard[row][col] = value
    setUserBoard(newBoard)

    if (value !== 0) {
      const newNotes = notes.map(row => row.map(cell => new Set(cell)))
      newNotes[row][col].clear()
      setNotes(newNotes)
    }

    const isBoardFull = newBoard.every(row => row.every(cell => cell !== 0))
    
    if (validateSolution(newBoard, solution)) {
      const finalTime = Math.floor((Date.now() - startTime - pausedTime) / 1000)
      const score = calculateScore(finalTime, difficulty)
      const performance = getPerformanceRating(score, difficulty)
      setElapsedTime(finalTime)
      setFinalScore(score)
      setIsComplete(true)
      setShowScoreDialog(true)

      const stats = loadStats()
      const updatedStats = updateStats(stats, {
        completed: true,
        difficulty,
        time: finalTime,
        score,
        hintsUsed: initialHints - hintsRemaining,
        rating: performance.rating,
        isDaily: false,
      })
      saveStats(updatedStats)

      const newAchievements = updatedStats.achievements.filter(
        (a, i) => a.unlocked && !stats.achievements[i].unlocked
      )
      if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
          toast.success(`Achievement Unlocked: ${achievement.title}`)
        })
      }
    } else if (isBoardFull) {
      toast.error('There are mistakes in your solution. Check the red cells.')
    }
  }

  const handleNoteToggle = (row: number, col: number, num: number) => {
    if (puzzle[row][col] !== 0 || isPaused || userBoard[row][col] !== 0) return

    const newNotes = notes.map(row => row.map(cell => new Set(cell)))
    if (newNotes[row][col].has(num)) {
      newNotes[row][col].delete(num)
    } else {
      newNotes[row][col].add(num)
    }
    setNotes(newNotes)
  }

  const handleNumberSelect = (num: number) => {
    if (selectedCell && !isPaused) {
      if (notesMode) {
        handleNoteToggle(selectedCell.row, selectedCell.col, num)
      } else {
        handleCellChange(selectedCell.row, selectedCell.col, num)
      }
    }
  }

  const handleClear = () => {
    if (selectedCell && !isPaused) {
      handleCellChange(selectedCell.row, selectedCell.col, 0)
      const newNotes = notes.map(row => row.map(cell => new Set(cell)))
      newNotes[selectedCell.row][selectedCell.col].clear()
      setNotes(newNotes)
    }
  }

  const handleReset = () => {
    setUserBoard(puzzle.map((row) => [...row]))
    setIsComplete(false)
    setSelectedCell(null)
    setGameStarted(false)
    setStartTime(0)
    setElapsedTime(0)
    setHintsRemaining(5)
    setMoveHistory([])
    setRedoStack([])
    setPausedTime(0)
    setNotes(Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>())))
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

  const handleSaveScore = async () => {
    console.log('[v0] handleSaveScore called')
    console.log('[v0] isConnected:', isConnected)
    console.log('[v0] address:', address)
    console.log('[v0] Contract address:', SUDOKU_SCORE_CONTRACT_ADDRESS)
    
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!SUDOKU_SCORE_CONTRACT_ADDRESS || SUDOKU_SCORE_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.error('[v0] Contract address not configured')
      toast.error('Smart contract not deployed yet. Please contact the administrator.')
      return
    }

    try {
      console.log('[v0] Starting validation...')
      toast.info('Validating your game...')
      
      const requestBody = {
        playerAddress: address,
        difficulty: DIFFICULTY_ENUM[difficulty],
        timeInSeconds: elapsedTime,
        score: finalScore,
        puzzle,
        solution: userBoard,
        gameId,
      }
      
      console.log('[v0] Request body:', requestBody)
      
      const validationResponse = await fetch('/api/validate-score', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('[v0] Response status:', validationResponse.status)
      
      if (!validationResponse.ok) {
        const error = await validationResponse.json()
        console.log('[v0] Validation error:', error)
        toast.error(error.error || 'Validation failed')
        return
      }

      const { signature, gameId: gameIdHash } = await validationResponse.json()
      console.log('[v0] Signature received:', signature)
      console.log('[v0] GameId hash received:', gameIdHash)

      console.log('[v0] Writing to contract...')
      console.log('[v0] Contract args:', [
        DIFFICULTY_ENUM[difficulty],
        BigInt(elapsedTime),
        BigInt(finalScore),
        gameIdHash,
        signature,
      ])

      try {
        writeContract({
          address: SUDOKU_SCORE_CONTRACT_ADDRESS as `0x${string}`,
          abi: SUDOKU_SCORE_ABI,
          functionName: 'saveScore',
          args: [
            DIFFICULTY_ENUM[difficulty],
            BigInt(elapsedTime),
            BigInt(finalScore),
            gameIdHash as `0x${string}`,
            signature as `0x${string}`,
          ],
        })
        console.log('[v0] Transaction initiated')
        toast.info('Transaction sent! Waiting for confirmation...')
      } catch (txError) {
        console.error('[v0] Transaction error:', txError)
        throw txError
      }
    } catch (error: any) {
      console.error('[v0] Error saving score:', error)
      console.error('[v0] Error details:', {
        message: error?.message,
        code: error?.code,
        data: error?.data,
      })
      toast.error(error?.message || 'Failed to save score. Please try again.')
    }
  }

  const handleNewGameFromDialog = () => {
    setShowScoreDialog(false)
    startNewGame(difficulty)
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading Sudoku...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-3 sm:p-4 md:p-6">
      <Tutorial />
      <AddToAppsDialog />
      
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6 animate-fade-in">
        <header className="text-center">
          <h1 className="mb-1 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">Sudoku</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Challenge your mind with classic puzzle game</p>
        </header>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <WalletConnect />
          <Link href="/daily">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Daily
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="sm" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </Button>
          </Link>
          <TutorialButton />
        </div>

        <DifficultySelector
          currentDifficulty={difficulty}
          onSelectDifficulty={startNewGame}
          disabled={false}
        />

        {!gameStarted && !isComplete && (
          <div className="flex justify-center">
            <Button 
              onClick={handleStartGame} 
              size="lg"
              className="gap-2 text-lg px-8 py-6 animate-pulse"
            >
              Play Game
            </Button>
          </div>
        )}

        {!isComplete && startTime > 0 && (
          <ScoreDisplay
            time={elapsedTime}
            score={calculateScore(elapsedTime, difficulty)}
            difficulty={difficulty}
          />
        )}

        <div className="relative flex justify-center">
          <SudokuBoard
            puzzle={puzzle}
            userBoard={userBoard}
            solution={solution}
            notes={notes}
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
          notesMode={notesMode}
          onNotesToggle={() => setNotesMode(!notesMode)}
          disabled={isComplete || selectedCell === null || isPaused}
        />

        <GameControls
          onReset={handleReset}
          onHint={handleHint}
          onNewGame={() => startNewGame(difficulty)}
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
