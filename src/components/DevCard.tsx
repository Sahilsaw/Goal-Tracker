import { useState } from 'react'
import type { DevItem } from '../types'
import { isLateCompletion, getDaysLate, formatCompletionDate } from '../lib/integrity'
import './DevCard.css'

interface DevCardProps {
  item: DevItem
  dateKey: string
  onToggle: () => void
  onRemove: () => void
  onAddSubtask: (title: string) => void
  onToggleSubtask: (subtaskId: string) => void
  onRemoveSubtask: (subtaskId: string) => void
}

export function DevCard({
  item,
  dateKey,
  onToggle,
  onRemove,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
}: DevCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [newSubtask, setNewSubtask] = useState('')

  const subtasks = item.subtasks || []
  const completedSubtasks = subtasks.filter((s) => s.done).length
  const hasSubtasks = subtasks.length > 0
  
  const isLate = item.done && isLateCompletion(dateKey, item.completedAt)
  const daysLate = isLate ? getDaysLate(dateKey, item.completedAt) : 0

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSubtask.trim()) {
      onAddSubtask(newSubtask.trim())
      setNewSubtask('')
    }
  }

  return (
    <li className={`dev-card ${item.done ? 'done' : ''} ${isLate ? 'late' : ''}`}>
      <div className="dev-card-main">
        <label className="dev-checkbox-label">
          <input
            type="checkbox"
            checked={item.done}
            onChange={onToggle}
            className="goal-checkbox"
            aria-label={`Mark ${item.title} complete`}
          />
        </label>

        <div className="dev-card-content">
          <div className="dev-card-header">
            <span className={`dev-title ${item.done ? 'done' : ''}`}>{item.title}</span>
            {hasSubtasks && (
              <span className="dev-subtask-count">
                {completedSubtasks}/{subtasks.length}
              </span>
            )}
            {isLate && (
              <span 
                className="late-badge" 
                title={`Completed ${formatCompletionDate(item.completedAt!)} (${daysLate} day${daysLate > 1 ? 's' : ''} late)`}
              >
                ⏰ Late
              </span>
            )}
          </div>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-link"
            >
              Open link →
            </a>
          )}

          {hasSubtasks && (
            <button
              type="button"
              className="dev-expand-btn"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '▼' : '▶'} {expanded ? 'Hide' : 'Show'} subtasks
            </button>
          )}
        </div>

        <div className="dev-card-actions">
          <button
            type="button"
            className="goal-remove-btn"
            onClick={onRemove}
            aria-label={`Remove ${item.title}`}
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>

      {(expanded || !hasSubtasks) && (
        <div className="dev-subtasks-section">
          {subtasks.length > 0 && (
            <ul className="dev-subtasks-list">
              {subtasks.map((subtask) => (
                <li key={subtask.id} className={`dev-subtask ${subtask.done ? 'done' : ''}`}>
                  <label className="dev-subtask-label">
                    <input
                      type="checkbox"
                      checked={subtask.done}
                      onChange={() => onToggleSubtask(subtask.id)}
                      className="dev-subtask-checkbox"
                    />
                    <span className={subtask.done ? 'done' : ''}>{subtask.title}</span>
                  </label>
                  <button
                    type="button"
                    className="dev-subtask-remove"
                    onClick={() => onRemoveSubtask(subtask.id)}
                    aria-label={`Remove subtask ${subtask.title}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddSubtask} className="dev-add-subtask-form">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add a subtask..."
              className="dev-subtask-input"
            />
            {newSubtask.trim() && (
              <button type="submit" className="dev-subtask-add-btn">
                +
              </button>
            )}
          </form>
        </div>
      )}
    </li>
  )
}
