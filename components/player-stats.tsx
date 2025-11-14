'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type PlayerStats } from '@/lib/achievements'
import { Trophy, Clock, Target, Flame, Award } from 'lucide-react'

interface PlayerStatsProps {
  stats: PlayerStats
}

export function PlayerStatsComponent({ stats }: PlayerStatsProps) {
  const formatTime = (seconds: number) => {
    if (seconds === Infinity) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesCompleted / stats.gamesPlayed) * 100) 
    : 0

  const avgTime = stats.gamesCompleted > 0 
    ? Math.round(stats.totalTime / stats.gamesCompleted) 
    : 0

  const unlockedCount = stats.achievements.filter(a => a.unlocked).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Statistics
          </CardTitle>
          <CardDescription>Track your Sudoku journey</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Games Completed
            </div>
            <div className="text-2xl font-bold">{stats.gamesCompleted}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Win Rate
            </div>
            <div className="text-2xl font-bold">{winRate}%</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Average Time
            </div>
            <div className="text-2xl font-bold">{formatTime(avgTime)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4" />
              Current Streak
            </div>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Best Times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Easy</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              {formatTime(stats.bestTimes.easy)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Medium</span>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              {formatTime(stats.bestTimes.medium)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Hard</span>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
              {formatTime(stats.bestTimes.hard)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Achievements
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {unlockedCount}/{stats.achievements.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {stats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  achievement.unlocked
                    ? 'border-chart-1/20 bg-chart-1/5'
                    : 'border-border bg-muted/30 opacity-60'
                }`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold">{achievement.title}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-1 text-xs text-chart-1">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {achievement.unlocked && (
                  <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                    Unlocked
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
