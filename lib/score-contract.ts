// Smart Contract ABI for Sudoku Score System on Base Network
export const SUDOKU_SCORE_ABI = [
  {
    inputs: [
      { internalType: 'uint8', name: 'difficulty', type: 'uint8' },
      { internalType: 'uint256', name: 'timeInSeconds', type: 'uint256' },
      { internalType: 'uint256', name: 'score', type: 'uint256' },
    ],
    name: 'saveScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerBestScore',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLeaderboard',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'player', type: 'address' },
          { internalType: 'uint256', name: 'score', type: 'uint256' },
          { internalType: 'uint8', name: 'difficulty', type: 'uint8' },
        ],
        internalType: 'struct SudokuScore.ScoreEntry[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerScores',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'player', type: 'address' },
          { internalType: 'uint256', name: 'score', type: 'uint256' },
          { internalType: 'uint8', name: 'difficulty', type: 'uint8' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        internalType: 'struct SudokuScore.ScoreEntry[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Contract address on Base Network (replace with your deployed contract)
export const SUDOKU_SCORE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`

// Difficulty enum mapping
export const DIFFICULTY_ENUM = {
  easy: 0,
  medium: 1,
  hard: 2,
} as const

export function calculateScore(timeInSeconds: number, difficulty: 'easy' | 'medium' | 'hard'): number {
  // Base scores for each difficulty
  const baseScores = { easy: 1000, medium: 2000, hard: 3000 }
  
  // Time thresholds for each difficulty (in seconds)
  const timeThresholds = {
    easy: { excellent: 180, good: 300, average: 600 },
    medium: { excellent: 300, good: 480, average: 900 },
    hard: { excellent: 600, good: 900, average: 1800 },
  }
  
  const baseScore = baseScores[difficulty]
  const threshold = timeThresholds[difficulty]
  
  // Calculate time multiplier
  let timeMultiplier = 1.0
  if (timeInSeconds <= threshold.excellent) {
    timeMultiplier = 2.0 // Excellent performance
  } else if (timeInSeconds <= threshold.good) {
    timeMultiplier = 1.5 // Good performance
  } else if (timeInSeconds <= threshold.average) {
    timeMultiplier = 1.2 // Average performance
  } else {
    // Penalty for slow completion
    const penalty = Math.min(0.5, (timeInSeconds - threshold.average) / threshold.average * 0.5)
    timeMultiplier = Math.max(0.5, 1.0 - penalty)
  }
  
  return Math.round(baseScore * timeMultiplier)
}

// Get performance rating based on score
export function getPerformanceRating(score: number, difficulty: 'easy' | 'medium' | 'hard'): {
  rating: string
  color: string
  emoji: string
} {
  const thresholds = {
    easy: { excellent: 1800, good: 1200, average: 800 },
    medium: { excellent: 3600, good: 2400, average: 1600 },
    hard: { excellent: 5400, good: 3600, average: 2400 },
  }
  
  const threshold = thresholds[difficulty]
  
  if (score >= threshold.excellent) {
    return { rating: 'Excellent', color: 'text-yellow-500', emoji: '🏆' }
  } else if (score >= threshold.good) {
    return { rating: 'Good', color: 'text-green-500', emoji: '⭐' }
  } else if (score >= threshold.average) {
    return { rating: 'Average', color: 'text-blue-500', emoji: '👍' }
  } else {
    return { rating: 'Keep Trying', color: 'text-gray-500', emoji: '💪' }
  }
}
