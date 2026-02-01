function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface DateNavigatorProps {
  currentDateKey: string
  onDateChange: (dateKey: string) => void
}

export function DateNavigator({ currentDateKey, onDateChange }: DateNavigatorProps) {
  const date = parseDateKey(currentDateKey)

  const goPrev = () => {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    onDateChange(formatDateKey(d))
  }

  const goNext = () => {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    onDateChange(formatDateKey(d))
  }

  const todayKey = formatDateKey(new Date())
  const isToday = currentDateKey === todayKey

  return (
    <nav className="date-navigator">
      <button type="button" onClick={goPrev} className="nav-btn" aria-label="Previous day">
        ←
      </button>
      <div className="date-display">
        <time dateTime={currentDateKey}>{formatDisplay(date)}</time>
        {isToday && <span className="today-badge">Today</span>}
      </div>
      <button type="button" onClick={goNext} className="nav-btn" aria-label="Next day">
        →
      </button>
    </nav>
  )
}
