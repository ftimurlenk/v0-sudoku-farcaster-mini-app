'use client'

import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { SUDOKU_SCORE_ABI, SUDOKU_SCORE_CONTRACT_ADDRESS } from '@/lib/score-contract'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'

type ScoreEntry = {
  player: `0x${string}`
  score: bigint
  difficulty: number
}

const difficultyNames = ['Easy', 'Medium', 'Hard']
const difficultyColors = {
  0: 'bg-green-500/10 text-green-600 border-green-500/20',
  1: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  2: 'bg-red-500/10 text-red-600 border-red-500/20',
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([])

  const { data, isLoading, isError, refetch } = useReadContract({
    address: SUDOKU_SCORE_CONTRACT_ADDRESS,
    abi: SUDOKU_SCORE_ABI,
    functionName: 'getLeaderboard',
  })

  useEffect(() => {
    if (data) {
      setLeaderboard(data as ScoreEntry[])
    }
  }, [data])

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="font-bold text-muted-foreground">{index + 1}</span>
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Loading top scores...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Unable to load leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Make sure your wallet is connected and the contract is deployed.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Global Leaderboard
        </CardTitle>
        <CardDescription>Top 10 players on Base Network</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No scores yet. Be the first to complete a puzzle!
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={`${entry.player}-${index}`}
                className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-medium">
                      {formatAddress(entry.player)}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={difficultyColors[entry.difficulty as keyof typeof difficultyColors]}
                    >
                      {difficultyNames[entry.difficulty]}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-chart-1">
                    {entry.score.toString()}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
