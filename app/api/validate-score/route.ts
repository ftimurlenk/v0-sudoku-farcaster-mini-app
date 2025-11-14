import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@farcaster/quick-auth'
import { Wallet, hashMessage } from 'ethers'

const client = createClient()
const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const token = authorization.split(' ')[1]

    let fid: number
    try {
      const payload = await client.verifyJwt({ token, domain })
      fid = payload.sub
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid Farcaster token' },
        { status: 401 }
      )
    }

    const { 
      playerAddress, 
      difficulty, 
      timeInSeconds, 
      score, 
      puzzle, 
      solution,
      gameId 
    } = await request.json()

    if (!validateSudoku(puzzle, solution)) {
      return NextResponse.json(
        { error: 'Invalid solution - Puzzle not correctly solved' },
        { status: 400 }
      )
    }

    const expectedScore = calculateScore(difficulty, timeInSeconds)
    if (Math.abs(expectedScore - score) > 100) {
      return NextResponse.json(
        { error: 'Score mismatch - Calculated score does not match' },
        { status: 400 }
      )
    }

    const minTime = difficulty === 0 ? 30 : difficulty === 1 ? 60 : 120
    if (timeInSeconds < minTime) {
      return NextResponse.json(
        { error: 'Completion time too fast - Possible cheating detected' },
        { status: 400 }
      )
    }

    if (!process.env.VALIDATOR_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const validator = new Wallet(process.env.VALIDATOR_PRIVATE_KEY)
    
    const messageHash = hashMessage(
      Buffer.from(
        `${playerAddress}${difficulty}${timeInSeconds}${score}${gameId}`.replace(/^0x/, ''),
        'hex'
      )
    )
    
    const signature = await validator.signMessage(messageHash)

    return NextResponse.json({
      signature,
      gameId,
      validated: true,
      fid, // Return FID for reference
    })

  } catch (error) {
    console.error('[v0] Validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}

function validateSudoku(puzzle: number[][], solution: number[][]): boolean {
  // Verify all original puzzle numbers are preserved
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (puzzle[i][j] !== 0 && puzzle[i][j] !== solution[i][j]) {
        return false
      }
    }
  }

  // Validate rows
  for (let i = 0; i < 9; i++) {
    const row = new Set(solution[i])
    if (row.size !== 9 || row.has(0)) return false
    for (let num = 1; num <= 9; num++) {
      if (!solution[i].includes(num)) return false
    }
  }

  // Validate columns
  for (let j = 0; j < 9; j++) {
    const col = solution.map(row => row[j])
    const colSet = new Set(col)
    if (colSet.size !== 9 || colSet.has(0)) return false
    for (let num = 1; num <= 9; num++) {
      if (!col.includes(num)) return false
    }
  }

  // Validate 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box: number[] = []
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          box.push(solution[boxRow * 3 + i][boxCol * 3 + j])
        }
      }
      const boxSet = new Set(box)
      if (boxSet.size !== 9 || boxSet.has(0)) return false
      for (let num = 1; num <= 9; num++) {
        if (!box.includes(num)) return false
      }
    }
  }

  return true
}

function calculateScore(difficulty: number, timeInSeconds: number): number {
  // Match the scoring logic from lib/score-contract.ts
  const baseScores = { 0: 1000, 1: 2000, 2: 3000 }
  
  const timeThresholds = {
    0: { excellent: 180, good: 300, average: 600 },
    1: { excellent: 300, good: 480, average: 900 },
    2: { excellent: 600, good: 900, average: 1800 },
  }
  
  const baseScore = baseScores[difficulty as 0 | 1 | 2]
  const threshold = timeThresholds[difficulty as 0 | 1 | 2]
  
  let timeMultiplier = 1.0
  if (timeInSeconds <= threshold.excellent) {
    timeMultiplier = 2.0
  } else if (timeInSeconds <= threshold.good) {
    timeMultiplier = 1.5
  } else if (timeInSeconds <= threshold.average) {
    timeMultiplier = 1.2
  } else {
    const penalty = Math.min(0.5, (timeInSeconds - threshold.average) / threshold.average * 0.5)
    timeMultiplier = Math.max(0.5, 1.0 - penalty)
  }
  
  return Math.round(baseScore * timeMultiplier)
}
