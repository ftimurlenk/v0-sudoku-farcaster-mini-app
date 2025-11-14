import { Leaderboard } from '@/components/leaderboard'
import { WalletConnect } from '@/components/wallet-connect'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LeaderboardPage() {
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
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top players competing on Base Network
          </p>
        </div>

        <Leaderboard />
      </div>
    </div>
  )
}
