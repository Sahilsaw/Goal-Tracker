import { ProgressRing } from './ProgressRing'
import { getCurrentStreak, getBestStreak } from '../lib/streaks'
import { getTotalXP, getWeekSummary } from '../lib/stats'
import type { GoalsByDate } from '../types'
import './StatsStrip.css'

interface StatsStripProps {
  goals: GoalsByDate
  dayDone: number
  dayTotal: number
}

export function StatsStrip({ goals, dayDone, dayTotal }: StatsStripProps) {
  const currentStreak = getCurrentStreak(goals)
  const bestStreak = getBestStreak(goals)
  const totalXP = getTotalXP(goals)
  const week = getWeekSummary(goals)

  return (
    <div className="stats-strip" role="region" aria-label="Progress and stats">
      <div className="stats-strip-row">
        <div className="stat-item stat-progress">
          <ProgressRing done={dayDone} total={dayTotal} size={48} strokeWidth={4} />
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{currentStreak}</span>
          <span className="stat-label">Current streak</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{bestStreak}</span>
          <span className="stat-label">Best streak</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalXP}</span>
          <span className="stat-label">Total XP</span>
        </div>
        <div className="stat-item stat-week">
          <span className="stat-value">
            {week.daysCompleted}/7 days · {week.tasksCompleted} tasks
          </span>
          <span className="stat-label">This week</span>
        </div>
      </div>
    </div>
  )
}
