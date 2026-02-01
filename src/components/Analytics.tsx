import { useState } from 'react'
import { WeeklyChart } from './charts/WeeklyChart'
import { CategoryPie } from './charts/CategoryPie'
import { 
  getWeeklyData, 
  getCategoryBreakdown, 
  getDsaTimeStats, 
  getTotalStats,
  formatTime 
} from '../lib/analytics'
import type { GoalsByDate } from '../types'
import './Analytics.css'

interface AnalyticsProps {
  goals: GoalsByDate
}

export function Analytics({ goals }: AnalyticsProps) {
  const [expanded, setExpanded] = useState(true)
  
  const weeklyData = getWeeklyData(goals, 7)
  const categoryStats = getCategoryBreakdown(goals)
  const timeStats = getDsaTimeStats(goals)
  const totalStats = getTotalStats(goals)
  
  // Calculate this week's completed tasks
  const thisWeekCompleted = weeklyData.reduce((sum, d) => sum + d.completed, 0)

  return (
    <div className="analytics-section">
      <button
        type="button"
        className="analytics-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="analytics-title">Analytics</span>
        <span className="analytics-toggle">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="analytics-content">
          {/* Weekly Summary */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <span className="analytics-card-title">This Week</span>
              <span className="analytics-card-value">{thisWeekCompleted} tasks</span>
            </div>
            <WeeklyChart data={weeklyData} />
          </div>

          {/* Overall Stats */}
          <div className="analytics-stats-row">
            <div className="analytics-mini-stat">
              <span className="analytics-mini-value">{totalStats.completedTasks}</span>
              <span className="analytics-mini-label">Total Done</span>
            </div>
            <div className="analytics-mini-stat">
              <span className="analytics-mini-value">{totalStats.completionRate}%</span>
              <span className="analytics-mini-label">Completion</span>
            </div>
            <div className="analytics-mini-stat">
              <span className="analytics-mini-value">{totalStats.daysWithData}</span>
              <span className="analytics-mini-label">Days Active</span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <span className="analytics-card-title">By Category</span>
            </div>
            <CategoryPie data={categoryStats} />
          </div>

          {/* DSA Time Stats */}
          {timeStats.questionsWithTime > 0 && (
            <div className="analytics-card analytics-time-card">
              <div className="analytics-card-header">
                <span className="analytics-card-title">DSA Time</span>
                <span className="analytics-card-value">{formatTime(timeStats.totalMinutes)}</span>
              </div>
              <div className="analytics-time-details">
                <span>Avg: {timeStats.averagePerQuestion}min/question</span>
                <span>{timeStats.questionsWithTime} tracked</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
