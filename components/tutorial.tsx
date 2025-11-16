'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const tutorialSteps = [
  {
    title: 'Welcome to Sudoku!',
    description:
      'Sudoku is a logic-based number puzzle. The goal is to fill a 9x9 grid with numbers 1-9.',
  },
  {
    title: 'The Rules',
    description:
      'Each row, column, and 3x3 box must contain all numbers from 1 to 9 without repetition.',
  },
  {
    title: 'How to Play',
    description:
      'Tap any empty cell to select it, then use the numeric keyboard or type a number. Green cells show correct numbers.',
  },
  {
    title: 'Game Features',
    description:
      'Get up to 5 hints per game. Pause anytime. Use Undo/Redo to fix mistakes.',
  },
  {
    title: 'Scoring',
    description:
      'Complete puzzles faster for higher scores! Save your best scores to Base Network and compete on the leaderboard.',
  },
]

export function Tutorial() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('sudoku_tutorial_completed')
    }
    return false
  })
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('sudoku_tutorial_completed', 'true')
    setIsOpen(false)
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setCurrentStep(0)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
          <DialogDescription className="pt-4 text-base leading-relaxed">
            {tutorialSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 pt-4">
          <div className="flex gap-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} size="sm">
                Previous
              </Button>
            )}
            <Button onClick={handleNext} size="sm">
              {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TutorialButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setCurrentStep(0)
    }
  }

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsOpen(false)
      setCurrentStep(0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} size="sm">
        How to Play
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
            <DialogDescription className="pt-4 text-base leading-relaxed">
              {tutorialSteps[currentStep].description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} size="sm">
                  Previous
                </Button>
              )}
              <Button onClick={handleNext} size="sm">
                {currentStep === tutorialSteps.length - 1 ? 'Done' : 'Next'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
