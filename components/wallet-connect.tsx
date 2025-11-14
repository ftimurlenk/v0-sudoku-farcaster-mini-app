'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'
import { useEffect } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      const farcasterConnector = connectors[0]
      if (farcasterConnector) {
        connect({ connector: farcasterConnector })
      }
    }
  }, [isConnected, connectors, connect])

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-card-foreground">
        <Wallet className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button onClick={() => disconnect()} variant="ghost" size="sm" className="h-7 px-2">
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
      <span className="text-sm text-muted-foreground">Connecting wallet...</span>
    </div>
  )
}
