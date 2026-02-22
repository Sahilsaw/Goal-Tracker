import type { HabitItem } from '../types'
import './HabitCard.css'

interface HabitCardProps {
  habit: HabitItem
  onToggle: () => void
  onRemove: () => void
}

export function HabitCard({ habit, onToggle, onRemove }: HabitCardProps) {
  return (
    <div 
      className={`habit-card ${habit.done ? 'done' : ''}`}
      onClick={onToggle}
      role="checkbox"
      aria-checked={habit.done}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div className="habit-card-content">
        {habit.icon && <span className="habit-icon">{habit.icon}</span>}
        <span className="habit-title">{habit.title}</span>
      </div>
      <div className="habit-card-check">
        {habit.done ? '✓' : ''}
      </div>
      <button
        type="button"
        className="habit-remove-btn"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${habit.title}`}
      >
        ×
      </button>
    </div>
  )
}
