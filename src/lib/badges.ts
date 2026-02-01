import { getCurrentStreak, getBestStreak } from './streaks'
import { getTotalXP } from './stats'
import type { GoalsByDate } from '../types'

const BADGES_STORAGE_PREFIX = 'badges_seen_'

export interface Badge {
  id: string
  label: string
  earned: boolean
  new: boolean
}

const BADGE_DEFS: { id: string; label: string; check: (goals: GoalsByDate) => boolean }[] = [
  { id: 'first_day', label: 'First day', check: (g) => Object.keys(g).some((d) => isDayFullComplete(g[d])) },
  { id: 'streak_3', label: '3-day streak', check: (g) => getCurrentStreak(g) >= 3 },
  { id: 'streak_7', label: 'Week warrior', check: (g) => getCurrentStreak(g) >= 7 },
  { id: 'streak_10', label: '10-day streak', check: (g) => getBestStreak(g) >= 10 },
  { id: 'tasks_10', label: '10 tasks', check: (g) => getTotalXP(g) >= 100 },
  { id: 'tasks_50', label: '50 tasks', check: (g) => getTotalXP(g) >= 500 },
]

function isDayFullComplete(day: { videos: { done: boolean }[]; dsa: { done: boolean }[]; dev: { done: boolean }[] }): boolean {
  const total = day.videos.length + day.dsa.length + day.dev.length
  if (total === 0) return false
  const done =
    day.videos.filter((v) => v.done).length +
    day.dsa.filter((d) => d.done).length +
    day.dev.filter((d) => d.done).length
  return done === total
}

function getSeenBadges(slug: string): Set<string> {
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_PREFIX + slug)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function markBadgesSeen(slug: string, badgeIds: string[]): void {
  const seen = getSeenBadges(slug)
  badgeIds.forEach((id) => seen.add(id))
  localStorage.setItem(BADGES_STORAGE_PREFIX + slug, JSON.stringify([...seen]))
}

export function getBadges(goals: GoalsByDate, slug: string | null): Badge[] {
  const seen = slug ? getSeenBadges(slug) : new Set<string>()
  return BADGE_DEFS.map((def) => {
    const earned = def.check(goals)
    const wasSeen = seen.has(def.id)
    return {
      id: def.id,
      label: def.label,
      earned,
      new: earned && !wasSeen,
    }
  })
}
