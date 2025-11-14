export type Difficulty = 'easy' | 'medium' | 'hard'

// Create an empty 9x9 grid
function createEmptyGrid(): number[][] {
  return Array(9)
    .fill(0)
    .map(() => Array(9).fill(0))
}

// Check if a number can be placed at a given position
function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false
  }

  // Check 3x3 box
  const startRow = row - (row % 3)
  const startCol = col - (col % 3)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false
    }
  }

  return true
}

// Solve the Sudoku puzzle using backtracking
function solveSudoku(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
        for (const num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num
            if (solveSudoku(board)) {
              return true
            }
            board[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

// Generate a complete Sudoku grid
function generateCompleteGrid(): number[][] {
  const grid = createEmptyGrid()
  solveSudoku(grid)
  return grid
}

// Remove numbers from the grid to create a puzzle
function createPuzzle(grid: number[][], difficulty: Difficulty): number[][] {
  const puzzle = grid.map((row) => [...row])
  
  const cellsToRemove = {
    easy: 35,    // 46 clues remaining (easier)
    medium: 45,  // 36 clues remaining (easier)
    hard: 52,    // 29 clues remaining (easier)
  }[difficulty]

  let removed = 0
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0
      removed++
    }
  }
  
  return puzzle
}

// Generate a new Sudoku puzzle with solution
export function generatePuzzle(difficulty: Difficulty): {
  puzzle: number[][]
  solution: number[][]
} {
  const solution = generateCompleteGrid()
  const puzzle = createPuzzle(solution, difficulty)
  
  return { puzzle, solution }
}

// Validate if the user's solution is correct
export function validateSolution(userBoard: number[][], solution: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (userBoard[row][col] !== solution[row][col]) {
        return false
      }
    }
  }
  return true
}
