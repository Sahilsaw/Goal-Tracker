import { Link } from 'react-router-dom'
import { ProgressRing } from './ProgressRing'
import { MiniCalendar } from './MiniCalendar'
import { ThemeToggle } from './ThemeToggle'
import { NotesSection } from './NotesSection'
import { getBadges } from '../lib/badges'
import { getCurrentStreak, getBestStreak } from '../lib/streaks'
import { getTotalXP, getWeekSummary } from '../lib/stats'
import type { GoalsByDate, NoteFile } from '../types'
import './Sidebar.css'

interface SidebarProps {
  goals: GoalsByDate
  slug: string | null
  dayDone: number
  dayTotal: number
  currentDateKey: string
  onDateSelect: (dateKey: string) => void
  isOpen?: boolean
  // Notes props
  notes: string
  noteFiles: NoteFile[]
  onUpdateNotes: (text: string) => void
  onAddFile: (file: File) => Promise<void>
  onRemoveFile: (fileId: string) => Promise<void>
}

export function Sidebar({
  goals,
  slug,
  dayDone,
  dayTotal,
  currentDateKey,
  onDateSelect,
  isOpen,
  notes,
  noteFiles,
  onUpdateNotes,
  onAddFile,
  onRemoveFile,
}: SidebarProps) {
  const currentStreak = getCurrentStreak(goals)
  const bestStreak = getBestStreak(goals)
  const totalXP = getTotalXP(goals)
  const week = getWeekSummary(goals)
  const badges = getBadges(goals, slug).filter((b) => b.earned)

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">Daily Goals</h1>
        <ThemeToggle />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-progress">
          <ProgressRing done={dayDone} total={dayTotal} size={72} strokeWidth={6} />
          <div className="sidebar-progress-info">
            <span className="sidebar-progress-label">Today's Progress</span>
            <span className="sidebar-progress-text">
              {dayTotal > 0 ? `${Math.round((dayDone / dayTotal) * 100)}%` : 'No tasks'}
            </span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{currentStreak}</span>
            <span className="sidebar-stat-label">Current streak</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{bestStreak}</span>
            <span className="sidebar-stat-label">Best streak</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{totalXP}</span>
            <span className="sidebar-stat-label">Total XP</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{week.daysCompleted}/7</span>
            <span className="sidebar-stat-label">Week days</span>
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Badges</h3>
          <div className="sidebar-badges">
            {badges.map((b) => (
              <span key={b.id} className="sidebar-badge" title={b.label}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-section">
        <Link to={`/g/${slug}/analytics`} className="sidebar-analytics-link">
          View Analytics
        </Link>
      </div>

      <div className="sidebar-section sidebar-calendar-section">
        <h3 className="sidebar-section-title">Calendar</h3>
        <MiniCalendar
          currentDateKey={currentDateKey}
          goals={goals}
          onDateSelect={onDateSelect}
        />
      </div>

      <div className="sidebar-section">
        <NotesSection
          notes={notes}
          noteFiles={noteFiles}
          onUpdateNotes={onUpdateNotes}
          onAddFile={onAddFile}
          onRemoveFile={onRemoveFile}
        />
      </div>
    </aside>
  )
}
