export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Complete your first Sudoku puzzle',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete an easy puzzle in under 3 minutes',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'master_solver',
    title: 'Master Solver',
    description: 'Complete a hard puzzle',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get an Excellent rating',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'no_hints',
    title: 'No Hints Needed',
    description: 'Complete a puzzle without using any hints',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'daily_champion',
    title: 'Daily Champion',
    description: 'Complete a daily challenge',
    icon: '📅',
    unlocked: false,
  },
  {
    id: 'streak_3',
    title: '3-Day Streak',
    description: 'Complete puzzles for 3 days in a row',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'games_10',
    title: 'Veteran Player',
    description: 'Complete 10 puzzles',
    icon: '🎮',
    unlocked: false,
  },
]

export function checkAchievements(
  stats: PlayerStats,
  currentGame: {
    completed: boolean
    difficulty: string
    time: number
    hintsUsed: number
    rating: string
    isDaily: boolean
  }
): string[] {
  const newAchievements: string[] = []

  if (currentGame.completed && stats.gamesCompleted === 1) {
    newAchievements.push('first_win')
  }

  if (currentGame.completed && currentGame.difficulty === 'easy' && currentGame.time < 180) {
    newAchievements.push('speed_demon')
  }

  if (currentGame.completed && currentGame.difficulty === 'hard') {
    newAchievements.push('master_solver')
  }

  if (currentGame.completed && currentGame.rating === 'Excellent') {
    newAchievements.push('perfect_score')
  }

  if (currentGame.completed && currentGame.hintsUsed === 0) {
    newAchievements.push('no_hints')
  }

  if (currentGame.completed && currentGame.isDaily) {
    newAchievements.push('daily_champion')
  }

  if (stats.currentStreak >= 3) {
    newAchievements.push('streak_3')
  }

  if (stats.gamesCompleted >= 10) {
    newAchievements.push('games_10')
  }

  return newAchievements
}

export type PlayerStats = {
  gamesPlayed: number
  gamesCompleted: number
  totalTime: number
  bestTimes: {
    easy: number
    medium: number
    hard: number
  }
  highestScore: number
  currentStreak: number
  lastPlayedDate: string
  achievements: Achievement[]
}

export function getDefaultStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesCompleted: 0,
    totalTime: 0,
    bestTimes: {
      easy: Infinity,
      medium: Infinity,
      hard: Infinity,
    },
    highestScore: 0,
    currentStreak: 0,
    lastPlayedDate: '',
    achievements: ACHIEVEMENTS.map(a => ({ ...a })),
  }
}

export function loadStats(): PlayerStats {
  if (typeof window === 'undefined') return getDefaultStats()
  
  const saved = localStorage.getItem('sudoku_stats')
  if (!saved) return getDefaultStats()
  
  try {
    return JSON.parse(saved)
  } catch {
    return getDefaultStats()
  }
}

export function saveStats(stats: PlayerStats) {
  if (typeof window === 'undefined') return
  localStorage.setItem('sudoku_stats', JSON.stringify(stats))
}

export function updateStats(
  currentStats: PlayerStats,
  gameData: {
    completed: boolean
    difficulty: 'easy' | 'medium' | 'hard'
    time: number
    score: number
    hintsUsed: number
    rating: string
    isDaily: boolean
  }
): PlayerStats {
  const newStats = { ...currentStats }
  newStats.gamesPlayed++

  if (gameData.completed) {
    newStats.gamesCompleted++
    newStats.totalTime += gameData.time
    
    if (gameData.time < newStats.bestTimes[gameData.difficulty]) {
      newStats.bestTimes[gameData.difficulty] = gameData.time
    }
    
    if (gameData.score > newStats.highestScore) {
      newStats.highestScore = gameData.score
    }

    const today = new Date().toDateString()
    const lastPlayed = new Date(newStats.lastPlayedDate).toDateString()
    
    if (today !== lastPlayed) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toDateString()
      
      if (lastPlayed === yesterdayStr) {
        newStats.currentStreak++
      } else {
        newStats.currentStreak = 1
      }
      newStats.lastPlayedDate = today
    }

    const unlockedAchievements = checkAchievements(newStats, {
      completed: gameData.completed,
      difficulty: gameData.difficulty,
      time: gameData.time,
      hintsUsed: gameData.hintsUsed,
      rating: gameData.rating,
      isDaily: gameData.isDaily,
    })

    unlockedAchievements.forEach(achievementId => {
      const achievement = newStats.achievements.find(a => a.id === achievementId)
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true
        achievement.unlockedAt = Date.now()
      }
    })
  }

  return newStats
}
