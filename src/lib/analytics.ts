import type { GoalsByDate, DayGoal } from '../types'

export interface DailyStats {
  date: string
  dayLabel: string
  videos: number
  dsa: number
  dev: number
  total: number
  completed: number
}

export interface CategoryStats {
  videos: number
  dsa: number
  dev: number
  total: number
}

export interface TrendPoint {
  date: string
  rate: number
}

export interface TimeStats {
  totalMinutes: number
  byDifficulty: {
    easy: number
    medium: number
    hard: number
  }
  averagePerQuestion: number
  questionsWithTime: number
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

function getTaskCounts(day: DayGoal | undefined): { videos: number; dsa: number; dev: number; total: number; completed: number } {
  if (!day) return { videos: 0, dsa: 0, dev: 0, total: 0, completed: 0 }
  
  const videos = day.videos.filter(v => v.done).length
  const dsa = day.dsa.filter(d => d.done).length
  const dev = day.dev.filter(d => d.done).length
  const total = day.videos.length + day.dsa.length + day.dev.length
  const completed = videos + dsa + dev
  
  return { videos, dsa, dev, total, completed }
}

/**
 * Get daily stats for the last N days
 */
export function getWeeklyData(goals: GoalsByDate, days: number = 7): DailyStats[] {
  const result: DailyStats[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateKey = formatDateKey(d)
    const day = goals[dateKey]
    const counts = getTaskCounts(day)
    
    result.push({
      date: dateKey,
      dayLabel: getDayLabel(d),
      ...counts,
    })
  }
  
  return result
}

/**
 * Get category breakdown for all completed tasks
 */
export function getCategoryBreakdown(goals: GoalsByDate): CategoryStats {
  let videos = 0
  let dsa = 0
  let dev = 0
  
  for (const day of Object.values(goals)) {
    videos += day.videos.filter(v => v.done).length
    dsa += day.dsa.filter(d => d.done).length
    dev += day.dev.filter(d => d.done).length
  }
  
  return {
    videos,
    dsa,
    dev,
    total: videos + dsa + dev,
  }
}

/**
 * Get completion rate trend over time
 */
export function getCompletionTrend(goals: GoalsByDate, days: number = 14): TrendPoint[] {
  const result: TrendPoint[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateKey = formatDateKey(d)
    const day = goals[dateKey]
    
    if (day) {
      const total = day.videos.length + day.dsa.length + day.dev.length
      const completed = 
        day.videos.filter(v => v.done).length +
        day.dsa.filter(d => d.done).length +
        day.dev.filter(d => d.done).length
      
      result.push({
        date: dateKey,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      })
    }
  }
  
  return result
}

/**
 * Get DSA time tracking stats
 */
export function getDsaTimeStats(goals: GoalsByDate): TimeStats {
  let totalMinutes = 0
  const byDifficulty = { easy: 0, medium: 0, hard: 0 }
  let questionsWithTime = 0
  
  for (const day of Object.values(goals)) {
    for (const dsa of day.dsa) {
      if (dsa.timeSpentMinutes && dsa.timeSpentMinutes > 0) {
        totalMinutes += dsa.timeSpentMinutes
        questionsWithTime++
        
        if (dsa.difficulty && byDifficulty[dsa.difficulty] !== undefined) {
          byDifficulty[dsa.difficulty] += dsa.timeSpentMinutes
        }
      }
    }
  }
  
  return {
    totalMinutes,
    byDifficulty,
    averagePerQuestion: questionsWithTime > 0 ? Math.round(totalMinutes / questionsWithTime) : 0,
    questionsWithTime,
  }
}

/**
 * Get total stats summary
 */
export function getTotalStats(goals: GoalsByDate): {
  totalTasks: number
  completedTasks: number
  completionRate: number
  daysWithData: number
} {
  let totalTasks = 0
  let completedTasks = 0
  let daysWithData = 0
  
  for (const day of Object.values(goals)) {
    const total = day.videos.length + day.dsa.length + day.dev.length
    if (total > 0) {
      daysWithData++
      totalTasks += total
      completedTasks +=
        day.videos.filter(v => v.done).length +
        day.dsa.filter(d => d.done).length +
        day.dev.filter(d => d.done).length
    }
  }
  
  return {
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    daysWithData,
  }
}

/**
 * Format minutes as hours and minutes
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export interface WeekStats {
  tasksCompleted: number
  totalTasks: number
  completionRate: number
  videos: number
  dsa: number
  dev: number
  dsaTimeMinutes: number
}

export interface WeeklyComparison {
  thisWeek: WeekStats
  lastWeek: WeekStats
  changes: {
    tasksCompleted: number
    completionRate: number
    videos: number
    dsa: number
    dev: number
    dsaTimeMinutes: number
  }
}

/**
 * Get stats for a specific date range
 */
function getWeekStats(goals: GoalsByDate, startDaysAgo: number, endDaysAgo: number): WeekStats {
  const today = new Date()
  let tasksCompleted = 0
  let totalTasks = 0
  let videos = 0
  let dsa = 0
  let dev = 0
  let dsaTimeMinutes = 0

  for (let i = startDaysAgo; i >= endDaysAgo; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateKey = formatDateKey(d)
    const day = goals[dateKey]

    if (day) {
      totalTasks += day.videos.length + day.dsa.length + day.dev.length
      
      const videosCompleted = day.videos.filter(v => v.done).length
      const dsaCompleted = day.dsa.filter(d => d.done).length
      const devCompleted = day.dev.filter(d => d.done).length
      
      videos += videosCompleted
      dsa += dsaCompleted
      dev += devCompleted
      tasksCompleted += videosCompleted + dsaCompleted + devCompleted

      // Sum DSA time
      for (const dsaItem of day.dsa) {
        if (dsaItem.timeSpentMinutes && dsaItem.timeSpentMinutes > 0) {
          dsaTimeMinutes += dsaItem.timeSpentMinutes
        }
      }
    }
  }

  return {
    tasksCompleted,
    totalTasks,
    completionRate: totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0,
    videos,
    dsa,
    dev,
    dsaTimeMinutes,
  }
}

/**
 * Compare this week's stats vs last week
 */
export function getWeeklyComparison(goals: GoalsByDate): WeeklyComparison {
  // This week: days 0-6 (today and 6 days before)
  const thisWeek = getWeekStats(goals, 6, 0)
  // Last week: days 7-13
  const lastWeek = getWeekStats(goals, 13, 7)

  return {
    thisWeek,
    lastWeek,
    changes: {
      tasksCompleted: thisWeek.tasksCompleted - lastWeek.tasksCompleted,
      completionRate: thisWeek.completionRate - lastWeek.completionRate,
      videos: thisWeek.videos - lastWeek.videos,
      dsa: thisWeek.dsa - lastWeek.dsa,
      dev: thisWeek.dev - lastWeek.dev,
      dsaTimeMinutes: thisWeek.dsaTimeMinutes - lastWeek.dsaTimeMinutes,
    },
  }
}
