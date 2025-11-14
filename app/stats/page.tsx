'use client'

import { useEffect, useState } from 'react'
import { PlayerStatsComponent } from '@/components/player-stats'
import { WalletConnect } from '@/components/wallet-connect'
import { loadStats, type PlayerStats } from '@/lib/achievements'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats | null>(null)

  useEffect(() => {
    setStats(loadStats())
  }, [])

  if (!stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading Stats...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Game
            </Button>
          </Link>
          <WalletConnect />
        </header>

        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            Statistics
          </h1>
          <p className="text-muted-foreground">
            Your personal Sudoku progress and achievements
          </p>
        </div>

        <PlayerStatsComponent stats={stats} />
      </div>
    </div>
  )
}
