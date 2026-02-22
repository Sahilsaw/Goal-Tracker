import { useState, useEffect } from 'react'
import type { HabitItem } from '../types'
import './HabitsSection.css'

const EMOJI_SUGGESTIONS = ['💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '✍️', '🎯', '⏰']

const BASE_URL = import.meta.env.BASE_URL

const ANIME_CHARACTERS = [
  { id: 'asta', name: 'Asta', quote: 'My magic is never giving up!', color: '#4a5568', image: `${BASE_URL}characters/asta.jpg` },
  { id: 'naruto', name: 'Naruto', quote: 'Hard work beats talent.', color: '#ed8936', image: `${BASE_URL}characters/naruto.jpg` },
  { id: 'deku', name: 'Deku', quote: 'I have to work harder than anyone else.', color: '#48bb78', image: `${BASE_URL}characters/deku.jpg` },
  { id: 'luffy', name: 'Luffy', quote: 'Take risks, create a future.', color: '#e53e3e', image: `${BASE_URL}characters/luffy.jpg` },
  { id: 'eren', name: 'Eren', quote: "If you don't fight, you can't win.", color: '#667eea', image: `${BASE_URL}characters/eren.jpg` },
  { id: 'vegeta', name: 'Vegeta', quote: 'Push through the pain.', color: '#3182ce', image: `${BASE_URL}characters/vegeta.jpg` },
  { id: 'levi', name: 'Levi', quote: "Make a choice you won't regret.", color: '#718096', image: `${BASE_URL}characters/levi.jpg` },
]

const STORAGE_KEY = 'training-arc-mentor'

function getStoredMentor(): string {
  if (typeof window === 'undefined') return 'naruto'
  return localStorage.getItem(STORAGE_KEY) || 'naruto'
}

interface HabitsSectionProps {
  habits: HabitItem[]
  onToggle: (habitId: string) => void
  onRemove: (habitId: string) => void
  onAdd: (title: string, icon?: string) => void
}

export function HabitsSection({ habits, onToggle, onRemove, onAdd }: HabitsSectionProps) {
  const [selectedMentor, setSelectedMentor] = useState(getStoredMentor)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined)

  const mentor = ANIME_CHARACTERS.find(c => c.id === selectedMentor) || ANIME_CHARACTERS[1]

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedMentor)
  }, [selectedMentor])

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
    <div 
      className="training-arc" 
      style={{ '--mentor-color': mentor.color } as React.CSSProperties}
    >
      {/* Mentor Selector */}
      <div className="mentor-section">
        <p className="mentor-label">Choose Your Training Mentor</p>
        <div className="mentor-selector">
          {ANIME_CHARACTERS.map((char) => (
            <button
              key={char.id}
              type="button"
              className={`mentor-avatar ${selectedMentor === char.id ? 'selected' : ''}`}
              onClick={() => setSelectedMentor(char.id)}
              title={char.name}
              style={{ '--char-color': char.color } as React.CSSProperties}
            >
              <img src={char.image} alt={char.name} />
              {selectedMentor === char.id && <span className="mentor-check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Mentor Quote */}
      <div className="mentor-quote-card">
        <div className="mentor-quote-avatar">
          <img src={mentor.image} alt={mentor.name} />
        </div>
        <div className="mentor-quote-content">
          <p className="mentor-quote-text">"{mentor.quote}"</p>
          <p className="mentor-quote-name">— {mentor.name}, your mentor</p>
        </div>
      </div>

      {/* Title Section */}
      <div className="training-arc-header">
        <h2 className="training-arc-title">TRAINING ARC</h2>
        <p className="training-arc-motto">This isn't a bad phase. It's my training arc.</p>
      </div>

      {/* Progress Bar */}
      <div className="training-arc-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
        <span className="progress-text">{completedCount}/{totalCount}</span>
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
          + Add Habit
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
    </div>
  )
}
