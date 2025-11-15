'use client'

import { useState, useEffect } from 'react'
import sdk from '@farcaster/miniapp-sdk'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function AddToAppsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('hasSeenAddToAppsPrompt')
    
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => {
        setOpen(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAddToApps = async () => {
    try {
      await sdk.actions.addMiniApp()
      localStorage.setItem('hasSeenAddToAppsPrompt', 'true')
      setOpen(false)
      toast.success('BaseDoku added to your apps!')
    } catch (error: any) {
      console.error('Failed to add to apps:', error)
      if (error?.message !== 'RejectedByUser') {
        toast.error('Failed to add app. Please try again.')
      }
      localStorage.setItem('hasSeenAddToAppsPrompt', 'true')
      setOpen(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('hasSeenAddToAppsPrompt', 'true')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Add BaseDoku to Your Apps</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Add BaseDoku to your Farcaster apps for quick access and never miss a daily challenge!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Plus className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Play Sudoku anytime, save scores onchain, and compete on the leaderboard
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleAddToApps} size="lg" className="w-full">
            Add to Apps
          </Button>
          <Button onClick={handleDismiss} variant="ghost" size="sm" className="w-full">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
