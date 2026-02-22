import { useState } from 'react'
import type { HabitItem } from '../types'
import './HabitsSection.css'

const EMOJI_SUGGESTIONS = ['💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '✍️', '🎯', '⏰']

const ANIME_CHARACTERS = [
  { name: 'Asta', quote: '"My magic is never gup."', color: '#4a5568' },
  { name: 'Naruto', quote: '"Hard work beats talent."', color: '#ed8936' },
  { name: 'Deku', quote: '"I have to work harder."', color: '#48bb78' },
  { name: 'Luffy', quote: '"Take risks, create a future."', color: '#e53e3e' },
  { name: 'Eren', quote: '"If you don\'t fight, you can\'t win."', color: '#667eea' },
  { name: 'Vegeta', quote: '"Push through the pain."', color: '#3182ce' },
  { name: 'Levi', quote: '"Make a choice you won\'t regret."', color: '#718096' },
]

const BOTTOM_QUOTES = [
  { text: 'Surpass your limits. Right here. Right now.', character: 'Yami' },
  { text: "If you don't fight, you can't win.", character: 'Eren' },
  { text: 'Push through the pain. Giving up hurts more.', character: 'Vegeta' },
]

interface HabitsSectionProps {
  habits: HabitItem[]
  onToggle: (habitId: string) => void
  onRemove: (habitId: string) => void
  onAdd: (title: string, icon?: string) => void
}

export function HabitsSection({ habits, onToggle, onRemove, onAdd }: HabitsSectionProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    
    onAdd(title, selectedEmoji)
    setNewTitle('')
    setSelectedEmoji(undefined)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setNewTitle('')
    setSelectedEmoji(undefined)
    setIsAdding(false)
  }

  const completedCount = habits.filter(h => h.done).length
  const totalCount = habits.length

  return (
    <div className="training-arc">
      {/* Anime Characters Header */}
      <div className="training-arc-characters">
        {ANIME_CHARACTERS.map((char) => (
          <div key={char.name} className="character-card" style={{ '--char-color': char.color } as React.CSSProperties}>
            <div className="character-avatar">
              <span className="character-initial">{char.name[0]}</span>
            </div>
            <p className="character-quote">{char.quote}</p>
            <p className="character-name">— {char.name}</p>
          </div>
        ))}
      </div>

      {/* Title Section */}
      <div className="training-arc-header">
        <h2 className="training-arc-title">TRAINING ARC</h2>
        <p className="training-arc-subtitle">30-DAY HABIT TRACKER</p>
        <p className="training-arc-motto">"THIS ISN'T A BAD PHASE. IT'S MY TRAINING ARC."</p>
      </div>

      {/* Progress Bar */}
      <div className="training-arc-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
        <span className="progress-text">{completedCount}/{totalCount} completed</span>
      </div>

      {/* Habits Grid */}
      <div className="training-arc-habits">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`habit-checkbox-card ${habit.done ? 'completed' : ''}`}
            onClick={() => onToggle(habit.id)}
            role="checkbox"
            aria-checked={habit.done}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggle(habit.id)
              }
            }}
          >
            <div className="habit-checkbox">
              {habit.done && <span className="checkmark">✓</span>}
            </div>
            <span className="habit-label">
              {habit.icon && <span className="habit-icon">{habit.icon}</span>}
              {habit.title}
            </span>
            <button
              type="button"
              className="habit-delete"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(habit.id)
              }}
              aria-label={`Remove ${habit.title}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add Habit */}
      {!isAdding ? (
        <button 
          type="button" 
          className="add-habit-btn"
          onClick={() => setIsAdding(true)}
        >
          + Add Custom Habit
        </button>
      ) : (
        <form className="add-habit-form" onSubmit={handleSubmit}>
          <div className="emoji-picker">
            {EMOJI_SUGGESTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
                onClick={() => setSelectedEmoji(selectedEmoji === emoji ? undefined : emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="add-habit-row">
            <input
              type="text"
              placeholder="New habit name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="habit-input"
            />
            <button type="submit" className="save-btn" disabled={!newTitle.trim()}>
              Add
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              ×
            </button>
          </div>
        </form>
      )}

      {/* Bottom Quotes */}
      <div className="training-arc-quotes">
        {BOTTOM_QUOTES.map((q, i) => (
          <p key={i} className="bottom-quote">
            "{q.text}" <span className="quote-author">— {q.character}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
