import { generatePuzzle, type Difficulty } from './sudoku-generator'

// Seed-based puzzle generation for daily challenges
export function getDailySeed(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDailyChallengeDifficulty(): Difficulty {
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  // Monday, Tuesday, Wednesday = Easy
  if (dayOfWeek >= 1 && dayOfWeek <= 3) return 'easy'
  // Thursday, Friday = Medium
  if (dayOfWeek === 4 || dayOfWeek === 5) return 'medium'
  // Saturday, Sunday = Hard
  return 'hard'
}

export function generateDailyChallenge() {
  const seed = getDailySeed()
  const difficulty = getDailyChallengeDifficulty()
  
  // Use seed to initialize random number generator
  const seededRandom = createSeededRandom(seed)
  
  // Generate puzzle with seeded random
  return generatePuzzleWithSeed(difficulty, seededRandom)
}

function createSeededRandom(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  let value = Math.abs(hash)
  
  return function() {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function generatePuzzleWithSeed(difficulty: Difficulty, random: () => number) {
  // Generate a complete solved grid using seeded random
  const grid = Array(9).fill(null).map(() => Array(9).fill(0))
  
  function isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num || grid[x][col] === num) return false
    }
    
    const startRow = row - (row % 3)
    const startCol = col - (col % 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false
      }
    }
    return true
  }
  
  function solve(grid: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
          // Shuffle numbers using seeded random
          for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1))
            ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
          }
          
          for (const num of numbers) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num
              if (solve(grid)) return true
              grid[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }
  
  solve(grid)
  
  const solution = grid.map(row => [...row])
  const puzzle = grid.map(row => [...row])
  
  const cluesCount = difficulty === 'easy' ? 46 : difficulty === 'medium' ? 36 : 29
  const cellsToRemove = 81 - cluesCount
  
  let removed = 0
  while (removed < cellsToRemove) {
    const row = Math.floor(random() * 9)
    const col = Math.floor(random() * 9)
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0
      removed++
    }
  }
  
  return { puzzle, solution }
}

export function formatChallengeDate(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('en-US', options)
}

export function getTimeUntilNextChallenge(): { hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { hours, minutes, seconds }
}
