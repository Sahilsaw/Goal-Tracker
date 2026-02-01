import { Link, useParams } from 'react-router-dom'
import { useGoals } from '../hooks/useGoals'
import { ThemeToggle } from '../components/ThemeToggle'
import { WeeklyChart } from '../components/charts/WeeklyChart'
import { CategoryPie } from '../components/charts/CategoryPie'
import { 
  getWeeklyData, 
  getCategoryBreakdown, 
  getDsaTimeStats, 
  getTotalStats,
  getWeeklyComparison,
  getIntegrityStats,
  formatTime 
} from '../lib/analytics'
import './AnalyticsPage.css'

export function AnalyticsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { goals, loading, error } = useGoals(slug ?? null)

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-page-loading">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-page-error">{error}</div>
      </div>
    )
  }

  const weeklyData = getWeeklyData(goals, 7)
  const twoWeekData = getWeeklyData(goals, 14)
  const categoryStats = getCategoryBreakdown(goals)
  const timeStats = getDsaTimeStats(goals)
  const totalStats = getTotalStats(goals)
  const comparison = getWeeklyComparison(goals)
  const integrityStats = getIntegrityStats(goals)

  const thisWeekCompleted = weeklyData.reduce((sum, d) => sum + d.completed, 0)
  const lastWeekData = twoWeekData.slice(0, 7)
  const lastWeekCompleted = lastWeekData.reduce((sum, d) => sum + d.completed, 0)
  const weekChange = thisWeekCompleted - lastWeekCompleted

  // Calculate improvement metrics
  const improvements = [
    comparison.changes.tasksCompleted > 0,
    comparison.changes.completionRate > 0,
    comparison.changes.videos > 0,
    comparison.changes.dsa > 0,
    comparison.changes.dev > 0,
    comparison.changes.dsaTimeMinutes > 0,
  ].filter(Boolean).length

  const hasAnyData = comparison.thisWeek.totalTasks > 0 || comparison.lastWeek.totalTasks > 0

  // Get summary message and status
  const getSummary = () => {
    if (!hasAnyData) {
      return { message: 'Start tracking to see your progress!', status: 'neutral' as const }
    }
    if (improvements >= 4) {
      return { message: 'Amazing week! You crushed it!', status: 'great' as const }
    }
    if (improvements >= 2) {
      return { message: 'Good progress! Keep it up!', status: 'good' as const }
    }
    if (comparison.thisWeek.tasksCompleted === comparison.lastWeek.tasksCompleted) {
      return { message: 'Consistent performance this week', status: 'neutral' as const }
    }
    return { message: 'Room for improvement - you got this!', status: 'needs-work' as const }
  }

  const summary = getSummary()

  // Helper to render comparison bar
  const renderComparisonBar = (
    label: string,
    icon: string,
    lastWeek: number,
    thisWeek: number,
    change: number,
    suffix: string = ''
  ) => {
    const max = Math.max(lastWeek, thisWeek, 1)
    const lastWeekPercent = (lastWeek / max) * 100
    const thisWeekPercent = (thisWeek / max) * 100
    
    return (
      <div className="comparison-item">
        <div className="comparison-item-header">
          <span className="comparison-item-icon">{icon}</span>
          <span className="comparison-item-label">{label}</span>
          <span className={`comparison-item-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}`}>
            {change === 0 ? '—' : `${change > 0 ? '+' : ''}${change}${suffix}`}
          </span>
        </div>
        <div className="comparison-bars">
          <div className="comparison-bar-row">
            <span className="comparison-bar-label">Last</span>
            <div className="comparison-bar-track">
              <div 
                className="comparison-bar-fill last-week" 
                style={{ width: `${lastWeekPercent}%` }}
              />
            </div>
            <span className="comparison-bar-value">{lastWeek}{suffix}</span>
          </div>
          <div className="comparison-bar-row">
            <span className="comparison-bar-label">This</span>
            <div className="comparison-bar-track">
              <div 
                className={`comparison-bar-fill this-week ${change > 0 ? 'improved' : change < 0 ? 'declined' : ''}`}
                style={{ width: `${thisWeekPercent}%` }}
              />
            </div>
            <span className="comparison-bar-value">{thisWeek}{suffix}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <header className="analytics-page-header">
        <div className="analytics-page-header-left">
          <Link to={`/g/${slug}`} className="analytics-back-btn">
            ← Back
          </Link>
          <h1 className="analytics-page-title">Analytics</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="analytics-page-content">
        {/* Summary Cards */}
        <div className="analytics-summary-row">
          <div className="analytics-summary-card">
            <span className="analytics-summary-value">{totalStats.completedTasks}</span>
            <span className="analytics-summary-label">Total Tasks Completed</span>
          </div>
          <div className="analytics-summary-card">
            <span className="analytics-summary-value">{totalStats.completionRate}%</span>
            <span className="analytics-summary-label">Overall Completion Rate</span>
          </div>
          <div className="analytics-summary-card">
            <span className="analytics-summary-value">{totalStats.daysWithData}</span>
            <span className="analytics-summary-label">Days Active</span>
          </div>
          {timeStats.totalMinutes > 0 && (
            <div className="analytics-summary-card">
              <span className="analytics-summary-value">{formatTime(timeStats.totalMinutes)}</span>
              <span className="analytics-summary-label">DSA Time Logged</span>
            </div>
          )}
        </div>

        {/* Weekly Progress */}
        <div className="analytics-card analytics-card-large">
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">This Week</h2>
            <div className="analytics-card-meta">
              <span className="analytics-card-value">{thisWeekCompleted} tasks</span>
              {weekChange !== 0 && (
                <span className={`analytics-card-change ${weekChange > 0 ? 'positive' : 'negative'}`}>
                  {weekChange > 0 ? '+' : ''}{weekChange} vs last week
                </span>
              )}
            </div>
          </div>
          <div className="analytics-chart-container">
            <WeeklyChart data={weeklyData} />
          </div>
        </div>

        {/* Week-over-Week Comparison */}
        <div className="analytics-card comparison-card">
          <div className="comparison-header-section">
            <h2 className="analytics-card-title">Week-over-Week</h2>
            <div className={`comparison-summary ${summary.status}`}>
              <span className="comparison-summary-icon">
                {summary.status === 'great' && '🔥'}
                {summary.status === 'good' && '👍'}
                {summary.status === 'neutral' && '📊'}
                {summary.status === 'needs-work' && '💪'}
              </span>
              <span className="comparison-summary-text">{summary.message}</span>
            </div>
          </div>
          
          {hasAnyData ? (
            <div className="comparison-grid">
              {renderComparisonBar(
                'Tasks Done',
                '✓',
                comparison.lastWeek.tasksCompleted,
                comparison.thisWeek.tasksCompleted,
                comparison.changes.tasksCompleted
              )}
              {renderComparisonBar(
                'Completion',
                '%',
                comparison.lastWeek.completionRate,
                comparison.thisWeek.completionRate,
                comparison.changes.completionRate,
                '%'
              )}
              {renderComparisonBar(
                'Videos',
                '▶',
                comparison.lastWeek.videos,
                comparison.thisWeek.videos,
                comparison.changes.videos
              )}
              {renderComparisonBar(
                'DSA',
                '⚡',
                comparison.lastWeek.dsa,
                comparison.thisWeek.dsa,
                comparison.changes.dsa
              )}
              {renderComparisonBar(
                'Dev Tasks',
                '⌨',
                comparison.lastWeek.dev,
                comparison.thisWeek.dev,
                comparison.changes.dev
              )}
              {renderComparisonBar(
                'DSA Time',
                '⏱',
                comparison.lastWeek.dsaTimeMinutes,
                comparison.thisWeek.dsaTimeMinutes,
                comparison.changes.dsaTimeMinutes,
                'm'
              )}
            </div>
          ) : (
            <div className="comparison-empty">
              <p>No data from the past two weeks yet.</p>
              <p className="comparison-empty-hint">Complete some tasks to see your week-over-week progress here!</p>
            </div>
          )}
        </div>

        {/* Two columns */}
        <div className="analytics-two-col">
          {/* Category Breakdown */}
          <div className="analytics-card">
            <h2 className="analytics-card-title">Tasks by Category</h2>
            <div className="analytics-category-content">
              <CategoryPie data={categoryStats} />
              <div className="analytics-category-details">
                <div className="analytics-category-row">
                  <span className="analytics-category-dot" style={{ background: '#ef4444' }} />
                  <span className="analytics-category-name">Videos</span>
                  <span className="analytics-category-count">{categoryStats.videos}</span>
                </div>
                <div className="analytics-category-row">
                  <span className="analytics-category-dot" style={{ background: '#22c55e' }} />
                  <span className="analytics-category-name">DSA Questions</span>
                  <span className="analytics-category-count">{categoryStats.dsa}</span>
                </div>
                <div className="analytics-category-row">
                  <span className="analytics-category-dot" style={{ background: '#3b82f6' }} />
                  <span className="analytics-category-name">Dev Tasks</span>
                  <span className="analytics-category-count">{categoryStats.dev}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DSA Time Stats */}
          <div className="analytics-card">
            <h2 className="analytics-card-title">DSA Time Tracking</h2>
            {timeStats.questionsWithTime > 0 ? (
              <div className="analytics-time-content">
                <div className="analytics-time-stat">
                  <span className="analytics-time-value">{formatTime(timeStats.totalMinutes)}</span>
                  <span className="analytics-time-label">Total Time</span>
                </div>
                <div className="analytics-time-stat">
                  <span className="analytics-time-value">{timeStats.averagePerQuestion}min</span>
                  <span className="analytics-time-label">Avg per Question</span>
                </div>
                <div className="analytics-time-stat">
                  <span className="analytics-time-value">{timeStats.questionsWithTime}</span>
                  <span className="analytics-time-label">Questions Tracked</span>
                </div>
                <div className="analytics-time-breakdown">
                  <h3>By Difficulty</h3>
                  <div className="analytics-time-row">
                    <span className="analytics-difficulty easy">Easy</span>
                    <span>{formatTime(timeStats.byDifficulty.easy)}</span>
                  </div>
                  <div className="analytics-time-row">
                    <span className="analytics-difficulty medium">Medium</span>
                    <span>{formatTime(timeStats.byDifficulty.medium)}</span>
                  </div>
                  <div className="analytics-time-row">
                    <span className="analytics-difficulty hard">Hard</span>
                    <span>{formatTime(timeStats.byDifficulty.hard)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="analytics-empty">
                <p>No time data yet.</p>
                <p className="analytics-empty-hint">Log time on DSA questions to see stats here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Integrity Stats */}
        {integrityStats.totalCompleted > 0 && (
          <div className="analytics-card integrity-card">
            <h2 className="analytics-card-title">Completion Integrity</h2>
            <div className="integrity-content">
              <div className="integrity-stat-row">
                <div className="integrity-stat">
                  <div className="integrity-stat-header">
                    <span className="integrity-stat-value">{integrityStats.onTimeRate}%</span>
                    <span className={`integrity-status ${integrityStats.onTimeRate >= 80 ? 'good' : integrityStats.onTimeRate >= 50 ? 'okay' : 'needs-work'}`}>
                      {integrityStats.onTimeRate >= 80 ? '✓ Great' : integrityStats.onTimeRate >= 50 ? '○ Okay' : '! Needs Work'}
                    </span>
                  </div>
                  <span className="integrity-stat-label">On-Time Completion</span>
                  <div className="integrity-bar">
                    <div 
                      className="integrity-bar-fill on-time" 
                      style={{ width: `${integrityStats.onTimeRate}%` }}
                    />
                  </div>
                  <span className="integrity-stat-detail">
                    {integrityStats.onTimeCount} on time, {integrityStats.lateCount} late
                  </span>
                </div>

                {(integrityStats.dsaWithTime > 0 || integrityStats.dsaWithoutTime > 0) && (
                  <div className="integrity-stat">
                    <div className="integrity-stat-header">
                      <span className="integrity-stat-value">{integrityStats.dsaTimeLoggedRate}%</span>
                      <span className={`integrity-status ${integrityStats.dsaTimeLoggedRate >= 70 ? 'good' : integrityStats.dsaTimeLoggedRate >= 40 ? 'okay' : 'needs-work'}`}>
                        {integrityStats.dsaTimeLoggedRate >= 70 ? '✓ Verified' : integrityStats.dsaTimeLoggedRate >= 40 ? '○ Partial' : '! Unverified'}
                      </span>
                    </div>
                    <span className="integrity-stat-label">DSA Time Logged</span>
                    <div className="integrity-bar">
                      <div 
                        className="integrity-bar-fill verified" 
                        style={{ width: `${integrityStats.dsaTimeLoggedRate}%` }}
                      />
                    </div>
                    <span className="integrity-stat-detail">
                      {integrityStats.dsaWithTime} with time, {integrityStats.dsaWithoutTime} without
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
