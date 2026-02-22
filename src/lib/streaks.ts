import type { DayGoal, GoalsByDate } from '../types'

function totalTasks(day: DayGoal): number {
  const habits = day.habits || []
  return day.videos.length + day.dsa.length + day.dev.length + habits.length
}

function doneTasks(day: DayGoal): number {
  const habits = day.habits || []
  return (
    day.videos.filter((v) => v.done).length +
    day.dsa.filter((d) => d.done).length +
    day.dev.filter((d) => d.done).length +
    habits.filter((h) => h.done).length
  )
}

/** A day is "completed" if it has at least one task and all tasks are done */
export function isDayCompleted(day: DayGoal): boolean {
  const total = totalTasks(day)
  if (total === 0) return false
  return doneTasks(day) === total
}

export function getCompletedDays(goals: GoalsByDate): Set<string> {
  const set = new Set<string>()
  for (const date of Object.keys(goals)) {
    if (isDayCompleted(goals[date])) set.add(date)
  }
  return set
}

function formatTodayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Current streak = consecutive completed days ending today (or yesterday if today not complete) */
export function getCurrentStreak(goals: GoalsByDate): number {
  const completed = getCompletedDays(goals)
  const today = formatTodayKey()
  const dates = Object.keys(goals).sort()

  if (dates.length === 0) return 0

  function prevDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  let streak = 0
  let cursor = today
  while (completed.has(cursor)) {
    streak++
    cursor = prevDate(cursor)
  }
  if (streak > 0) return streak
  if (!completed.has(today)) {
    cursor = prevDate(today)
    while (completed.has(cursor)) {
      streak++
      cursor = prevDate(cursor)
    }
  }
  return streak
}

/** Best streak = max consecutive completed days in the dataset */
export function getBestStreak(goals: GoalsByDate): number {
  const completed = getCompletedDays(goals)
  const dates = [...Object.keys(goals)].sort()
  if (dates.length === 0) return 0

  function nextDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  let best = 0
  const seen = new Set<string>()
  for (const start of dates) {
    if (!completed.has(start) || seen.has(start)) continue
    let count = 0
    let cursor = start
    while (completed.has(cursor)) {
      count++
      seen.add(cursor)
      cursor = nextDate(cursor)
    }
    if (count > best) best = count
  }
  return best
}
