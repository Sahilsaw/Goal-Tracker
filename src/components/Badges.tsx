import { useEffect } from 'react'
import { getBadges, markBadgesSeen } from '../lib/badges'
import type { GoalsByDate } from '../types'
import './Badges.css'

interface BadgesProps {
  goals: GoalsByDate
  slug: string | null
}

export function Badges({ goals, slug }: BadgesProps) {
  const badges = getBadges(goals, slug)
  const earned = badges.filter((b) => b.earned)
  const newIds = badges.filter((b) => b.new).map((b) => b.id)

  useEffect(() => {
    if (slug && newIds.length > 0) {
      markBadgesSeen(slug, newIds)
    }
  }, [slug, newIds.join(',')])

  if (earned.length === 0) return null

  return (
    <div className="badges-wrap" role="region" aria-label="Achievements">
      <span className="badges-label">Badges</span>
      <div className="badges-list">
        {earned.map((b) => (
          <span
            key={b.id}
            className={`badge-item ${b.new ? 'badge-new' : ''}`}
            title={b.label}
          >
            <span className="badge-dot" aria-hidden />
            {b.label}
            {b.new && <span className="badge-new-tag">New</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
