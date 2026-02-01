import { useState } from 'react'
import type { DsaItem } from '../types'
import { getPlatformName, getPlatformColor, getDifficultyColor, getDifficultyLabel } from '../lib/platforms'
import './DsaCard.css'

interface DsaCardProps {
  item: DsaItem
  onToggle: () => void
  onRemove: () => void
  onUpdate: (updates: Partial<DsaItem>) => void
}

export function DsaCard({ item, onToggle, onRemove, onUpdate }: DsaCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [showTimeInput, setShowTimeInput] = useState(false)
  const [timeInput, setTimeInput] = useState(item.timeSpentMinutes?.toString() || '')

  const handleTimeSubmit = () => {
    const minutes = parseInt(timeInput, 10)
    if (!isNaN(minutes) && minutes >= 0) {
      onUpdate({ timeSpentMinutes: minutes })
    }
    setShowTimeInput(false)
  }

  return (
    <li className={`dsa-card ${item.done ? 'done' : ''}`}>
      <div className="dsa-card-main">
        <label className="dsa-checkbox-label">
          <input
            type="checkbox"
            checked={item.done}
            onChange={onToggle}
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
              <span className="dsa-time-badge">
                {item.timeSpentMinutes} min
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
    </li>
  )
}
