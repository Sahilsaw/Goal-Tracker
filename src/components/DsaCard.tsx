import { useState } from 'react'
import type { DsaItem } from '../types'
import { getPlatformName, getPlatformColor, getDifficultyColor, getDifficultyLabel } from '../lib/platforms'
import { isLateCompletion, getDaysLate, formatCompletionDate } from '../lib/integrity'
import './DsaCard.css'

interface DsaCardProps {
  item: DsaItem
  dateKey: string
  onToggle: () => void
  onRemove: () => void
  onUpdate: (updates: Partial<DsaItem>) => void
}

export function DsaCard({ item, dateKey, onToggle, onRemove, onUpdate }: DsaCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [showTimeInput, setShowTimeInput] = useState(false)
  const [showTimePrompt, setShowTimePrompt] = useState(false)
  const [timeInput, setTimeInput] = useState(item.timeSpentMinutes?.toString() || '')
  
  const isLate = item.done && isLateCompletion(dateKey, item.completedAt)
  const daysLate = isLate ? getDaysLate(dateKey, item.completedAt) : 0
  const hasNoTimeLogged = item.done && (item.timeSpentMinutes === undefined || item.timeSpentMinutes === 0)

  const handleToggleWithPrompt = () => {
    // If marking as done and no time logged, show prompt
    if (!item.done && (item.timeSpentMinutes === undefined || item.timeSpentMinutes === 0)) {
      setShowTimePrompt(true)
    }
    onToggle()
  }

  const handleTimeSubmit = () => {
    const minutes = parseInt(timeInput, 10)
    if (!isNaN(minutes) && minutes >= 0) {
      onUpdate({ timeSpentMinutes: minutes })
    }
    setShowTimeInput(false)
    setShowTimePrompt(false)
  }

  const handleSkipTimePrompt = () => {
    setShowTimePrompt(false)
  }

  return (
    <li className={`dsa-card ${item.done ? 'done' : ''} ${isLate ? 'late' : ''}`}>
      <div className="dsa-card-main">
        <label className="dsa-checkbox-label">
          <input
            type="checkbox"
            checked={item.done}
            onChange={handleToggleWithPrompt}
            className="goal-checkbox"
            aria-label={`Mark ${item.title} complete`}
          />
        </label>
        
        <div className="dsa-card-content">
          <div className="dsa-card-header">
            {item.platform && (
              <span 
                className="dsa-platform-badge"
                style={{ backgroundColor: getPlatformColor(item.platform) }}
              >
                {getPlatformName(item.platform)}
              </span>
            )}
            {item.difficulty && (
              <span 
                className="dsa-difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(item.difficulty) }}
              >
                {getDifficultyLabel(item.difficulty)}
              </span>
            )}
            {item.timeSpentMinutes !== undefined && item.timeSpentMinutes > 0 && (
              <span className="dsa-time-badge dsa-time-verified" title="Time logged - verified">
                ✓ {item.timeSpentMinutes} min
              </span>
            )}
            {hasNoTimeLogged && (
              <span className="dsa-time-badge dsa-time-unverified" title="No time logged">
                No time
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
          
          <span className={`dsa-title ${item.done ? 'done' : ''}`}>{item.title}</span>
          
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="dsa-link"
            >
              Open Problem →
            </a>
          )}
          
          {item.notes && (
            <button
              type="button"
              className="dsa-notes-toggle"
              onClick={() => setShowNotes(!showNotes)}
            >
              {showNotes ? 'Hide notes' : 'Show notes'}
            </button>
          )}
          
          {showNotes && item.notes && (
            <p className="dsa-notes">{item.notes}</p>
          )}
        </div>
        
        <div className="dsa-card-actions">
          {!showTimeInput ? (
            <button
              type="button"
              className="dsa-time-btn"
              onClick={() => setShowTimeInput(true)}
              title="Log time"
            >
              ⏱
            </button>
          ) : (
            <div className="dsa-time-input-wrap">
              <input
                type="number"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                placeholder="min"
                className="dsa-time-input"
                min="0"
                autoFocus
              />
              <button type="button" onClick={handleTimeSubmit} className="dsa-time-save">
                ✓
              </button>
              <button type="button" onClick={() => setShowTimeInput(false)} className="dsa-time-cancel">
                ✕
              </button>
            </div>
          )}
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
      
      {/* Time prompt shown after marking complete */}
      {showTimePrompt && item.done && (
        <div className="dsa-time-prompt">
          <span className="dsa-time-prompt-text">How long did this take?</span>
          <div className="dsa-time-prompt-actions">
            <input
              type="number"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="minutes"
              className="dsa-time-prompt-input"
              min="0"
              autoFocus
            />
            <button type="button" onClick={handleTimeSubmit} className="dsa-time-prompt-save">
              Save
            </button>
            <button type="button" onClick={handleSkipTimePrompt} className="dsa-time-prompt-skip">
              Skip
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
