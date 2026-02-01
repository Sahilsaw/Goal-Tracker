import { useState } from 'react'
import type { DsaItem, DevItem, VideoItem, Difficulty, DsaPlatform } from '../types'
import type { SectionKind } from '../types'
import { DsaCard } from './DsaCard'
import { DevCard } from './DevCard'
import { detectPlatform } from '../lib/platforms'
import './GoalSection.css'

type Item = VideoItem | DsaItem | DevItem

interface GoalSectionProps {
  title: string
  kind: SectionKind
  items: Item[]
  doneCount: number
  totalCount: number
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onAdd: (payload: { 
    title: string
    url?: string
    link?: string
    platform?: DsaPlatform
    difficulty?: Difficulty
    notes?: string
  }) => void
  // DSA specific
  onUpdateDsa?: (id: string, updates: Partial<DsaItem>) => void
  // Dev specific
  onAddSubtask?: (devItemId: string, title: string) => void
  onToggleSubtask?: (devItemId: string, subtaskId: string) => void
  onRemoveSubtask?: (devItemId: string, subtaskId: string) => void
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

function VideoCard({ item, onToggle, onRemove }: { item: VideoItem; onToggle: () => void; onRemove: () => void }) {
  const videoId = getYouTubeVideoId(item.url)
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null

  return (
    <li className={`video-card ${item.done ? 'done' : ''}`}>
      {thumbnail ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="video-thumbnail-link">
          <img src={thumbnail} alt={item.title} className="video-thumbnail" loading="lazy" />
          <span className="video-play-icon">▶</span>
        </a>
      ) : item.url ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="video-thumbnail-link video-thumbnail-placeholder">
          <span className="video-play-icon">▶</span>
        </a>
      ) : null}
      <div className="video-info">
        <label className="video-label">
          <input type="checkbox" checked={item.done} onChange={onToggle} className="goal-checkbox" aria-label={`Mark ${item.title} complete`} />
          <span className="video-title">{item.title}</span>
        </label>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="video-url">
            {videoId ? 'Watch on YouTube' : 'Open link'}
          </a>
        )}
      </div>
      <button type="button" className="goal-remove-btn" onClick={onRemove} aria-label={`Remove ${item.title}`} title="Remove">×</button>
    </li>
  )
}

export function GoalSection({
  title,
  kind,
  items,
  doneCount,
  totalCount,
  onToggle,
  onRemove,
  onAdd,
  onUpdateDsa,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
}: GoalSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [difficultyInput, setDifficultyInput] = useState<Difficulty | ''>('')
  const [notesInput, setNotesInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleInput.trim()) return
    
    if (kind === 'videos') {
      onAdd({ title: titleInput.trim(), url: urlInput.trim() })
    } else if (kind === 'dsa') {
      const platform = detectPlatform(urlInput.trim())
      onAdd({ 
        title: titleInput.trim(), 
        link: urlInput.trim() || undefined,
        platform: platform || undefined,
        difficulty: difficultyInput || undefined,
        notes: notesInput.trim() || undefined,
      })
    } else {
      onAdd({ title: titleInput.trim(), link: urlInput.trim() || undefined })
    }
    
    setTitleInput('')
    setUrlInput('')
    setDifficultyInput('')
    setNotesInput('')
    setShowForm(false)
  }

  const resetForm = () => {
    setShowForm(false)
    setTitleInput('')
    setUrlInput('')
    setDifficultyInput('')
    setNotesInput('')
  }

  return (
    <section className="goal-section">
      <h2 className="section-title">
        {title}
        <span className="progress-badge">{doneCount}/{totalCount}</span>
      </h2>
      
      {kind === 'videos' && (
        <ul className="video-list">
          {(items as VideoItem[]).map((item) => (
            <VideoCard key={item.id} item={item} onToggle={() => onToggle(item.id)} onRemove={() => onRemove(item.id)} />
          ))}
        </ul>
      )}

      {kind === 'dsa' && (
        <ul className="dsa-list">
          {(items as DsaItem[]).map((item) => (
            <DsaCard
              key={item.id}
              item={item}
              onToggle={() => onToggle(item.id)}
              onRemove={() => onRemove(item.id)}
              onUpdate={(updates) => onUpdateDsa?.(item.id, updates)}
            />
          ))}
        </ul>
      )}

      {kind === 'dev' && (
        <ul className="dev-list">
          {(items as DevItem[]).map((item) => (
            <DevCard
              key={item.id}
              item={item}
              onToggle={() => onToggle(item.id)}
              onRemove={() => onRemove(item.id)}
              onAddSubtask={(subtaskTitle) => onAddSubtask?.(item.id, subtaskTitle)}
              onToggleSubtask={(subtaskId) => onToggleSubtask?.(item.id, subtaskId)}
              onRemoveSubtask={(subtaskId) => onRemoveSubtask?.(item.id, subtaskId)}
            />
          ))}
        </ul>
      )}

      {items.length === 0 && (
        <p className="goal-section-empty">No {title.toLowerCase()} yet. Add your first one below.</p>
      )}
      
      {!showForm ? (
        <button type="button" className="add-btn" onClick={() => setShowForm(true)}>
          + Add {kind === 'dsa' ? 'Question' : kind === 'dev' ? 'Task' : 'Video'}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="add-form">
          <input
            type="text"
            placeholder={kind === 'dsa' ? 'Problem title (e.g. Two Sum)' : 'Title'}
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="add-input"
            autoFocus
          />
          <input
            type="text"
            placeholder={kind === 'videos' ? 'YouTube URL' : kind === 'dsa' ? 'Problem URL (LeetCode, HackerRank, etc.)' : 'Link (optional)'}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="add-input"
          />
          
          {kind === 'dsa' && (
            <>
              <div className="dsa-form-row">
                <select
                  value={difficultyInput}
                  onChange={(e) => setDifficultyInput(e.target.value as Difficulty | '')}
                  className="dsa-difficulty-select"
                >
                  <option value="">Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <textarea
                placeholder="Notes or hints (optional)"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="dsa-notes-input"
              />
            </>
          )}
          
          <div className="add-form-actions">
            <button type="submit" className="add-btn primary">Add</button>
            <button type="button" className="add-btn" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  )
}
