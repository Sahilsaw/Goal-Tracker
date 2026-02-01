import type { DayGoal, GoalsByDate } from '../types'
import { isDayCompleted } from './streaks'

const XP_PER_TASK = 10
const XP_DAY_BONUS = 50

function totalDone(day: DayGoal): number {
  return (
    day.videos.filter((v) => v.done).length +
    day.dsa.filter((d) => d.done).length +
    day.dev.filter((d) => d.done).length
  )
}

/** Total XP from all goals: +10 per task done, +50 per full day */
export function getTotalXP(goals: GoalsByDate): number {
  let xp = 0
  for (const date of Object.keys(goals)) {
    const day = goals[date]
    const done = totalDone(day)
    xp += done * XP_PER_TASK
    if (isDayCompleted(day)) xp += XP_DAY_BONUS
  }
  return xp
}

/** XP for a single day */
export function getDayXP(day: DayGoal): number {
  const done = totalDone(day)
  let xp = done * XP_PER_TASK
  if (isDayCompleted(day)) xp += XP_DAY_BONUS
  return xp
}

/** Last 7 calendar days (including today) */
function getLast7DateKeys(): string[] {
  const out: string[] = []
  const d = new Date()
  for (let i = 0; i < 7; i++) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    out.push(`${y}-${m}-${day}`)
    d.setDate(d.getDate() - 1)
  }
  return out
}

export function getWeekSummary(goals: GoalsByDate): {
  daysCompleted: number
  tasksCompleted: number
} {
  const last7 = getLast7DateKeys()
  let daysCompleted = 0
  let tasksCompleted = 0
  for (const date of last7) {
    const day = goals[date]
    if (!day) continue
    if (isDayCompleted(day)) daysCompleted++
    tasksCompleted += totalDone(day)
  }
  return { daysCompleted, tasksCompleted }
}
