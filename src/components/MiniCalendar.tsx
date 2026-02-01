import { isDayCompleted } from '../lib/streaks'
import type { GoalsByDate } from '../types'
import './MiniCalendar.css'

function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface MiniCalendarProps {
  currentDateKey: string
  goals: GoalsByDate
  onDateSelect: (dateKey: string) => void
}

export function MiniCalendar({ currentDateKey, goals, onDateSelect }: MiniCalendarProps) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const daysInMonth = last.getDate()
  const todayKey = formatDateKey(now)

  const cells: { dateKey: string; day: number; isCurrent: boolean; isToday: boolean; hasData: boolean; isComplete: boolean }[] = []

  for (let i = 0; i < startPad; i++) {
    cells.push({ dateKey: '', day: 0, isCurrent: false, isToday: false, hasData: false, isComplete: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(new Date(year, month, d))
    const dayGoal = goals[dateKey]
    const hasData = !!dayGoal && (dayGoal.videos.length + dayGoal.dsa.length + dayGoal.dev.length) > 0
    const isComplete = !!dayGoal && isDayCompleted(dayGoal)
    cells.push({
      dateKey,
      day: d,
      isCurrent: dateKey === currentDateKey,
      isToday: dateKey === todayKey,
      hasData,
      isComplete,
    })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="mini-calendar" role="application" aria-label="Calendar">
      <div className="mini-calendar-weekdays">
        {weekDays.map((w) => (
          <span key={w} className="mini-calendar-weekday">
            {w}
          </span>
        ))}
      </div>
      <div className="mini-calendar-grid">
        {cells.map((cell, i) =>
          cell.dateKey ? (
            <button
              key={cell.dateKey}
              type="button"
              className={`mini-calendar-day ${cell.isCurrent ? 'selected' : ''} ${cell.isToday ? 'today' : ''} ${cell.hasData ? 'has-data' : ''} ${cell.isComplete ? 'complete' : ''}`}
              onClick={() => onDateSelect(cell.dateKey)}
              aria-label={`${cell.dateKey}${cell.isComplete ? ', all tasks done' : ''}`}
              aria-pressed={cell.isCurrent}
            >
              {cell.day}
            </button>
          ) : (
            <span key={`pad-${i}`} className="mini-calendar-day pad" aria-hidden />
          )
        )}
      </div>
    </div>
  )
}
