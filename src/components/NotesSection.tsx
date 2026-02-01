import { useState, useRef, useCallback, useEffect } from 'react'
import type { NoteFile } from '../types'
import { isImageFile, isPdfFile } from '../lib/storage'
import './NotesSection.css'

interface NotesSectionProps {
  notes: string
  noteFiles: NoteFile[]
  onUpdateNotes: (text: string) => void
  onAddFile: (file: File) => Promise<void>
  onRemoveFile: (fileId: string) => Promise<void>
}

export function NotesSection({
  notes,
  noteFiles,
  onUpdateNotes,
  onAddFile,
  onRemoveFile,
}: NotesSectionProps) {
  const [expanded, setExpanded] = useState(true)
  const [localNotes, setLocalNotes] = useState(notes)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number | null>(null)
  const saveTimeoutRef = useRef<number | null>(null)

  // Sync local notes when prop changes (e.g., date changes)
  useEffect(() => {
    setLocalNotes(notes)
    setSaveStatus('idle')
  }, [notes])

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value
      setLocalNotes(text)
      setSaveStatus('saving')
      
      // Debounce save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      debounceRef.current = window.setTimeout(() => {
        onUpdateNotes(text)
        setSaveStatus('saved')
        
        // Hide "Saved" after 2 seconds
        saveTimeoutRef.current = window.setTimeout(() => {
          setSaveStatus('idle')
        }, 2000)
      }, 500)
    },
    [onUpdateNotes]
  )

  const handleNotesBlur = useCallback(() => {
    // Save immediately on blur
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (localNotes !== notes) {
      onUpdateNotes(localNotes)
      setSaveStatus('saved')
      
      // Hide "Saved" after 2 seconds
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = window.setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    }
  }, [localNotes, notes, onUpdateNotes])

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      
      setUploading(true)
      try {
        for (const file of Array.from(files)) {
          await onAddFile(file)
        }
      } finally {
        setUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [onAddFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleRemoveFile = useCallback(
    async (fileId: string) => {
      await onRemoveFile(fileId)
    },
    [onRemoveFile]
  )

  const getFileIcon = (type: string) => {
    if (isImageFile(type)) return '🖼️'
    if (isPdfFile(type)) return '📄'
    return '📎'
  }

  return (
    <div className="notes-section">
      <button
        type="button"
        className="notes-section-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="notes-section-title">Notes</span>
        <span className="notes-section-toggle">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="notes-section-content">
          <div className="notes-textarea-wrap">
            <textarea
              className="notes-textarea"
              placeholder="Write your notes for the day..."
              value={localNotes}
              onChange={handleNotesChange}
              onBlur={handleNotesBlur}
              rows={4}
            />
            {saveStatus !== 'idle' && (
              <span className={`notes-save-status ${saveStatus}`}>
                {saveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
              </span>
            )}
          </div>

          <div
            className={`notes-files-area ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {noteFiles.length > 0 && (
              <ul className="notes-files-list">
                {noteFiles.map((file) => (
                  <li key={file.id} className="notes-file-item">
                    <span className="notes-file-icon">{getFileIcon(file.type)}</span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="notes-file-name"
                      title={file.name}
                    >
                      {file.name}
                    </a>
                    <button
                      type="button"
                      className="notes-file-remove"
                      onClick={() => handleRemoveFile(file.id)}
                      title="Remove file"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="notes-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                className="notes-file-input"
                onChange={(e) => handleFileSelect(e.target.files)}
                multiple
                disabled={uploading}
              />
              <button
                type="button"
                className="notes-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '+ Add file'}
              </button>
              <span className="notes-upload-hint">or drag and drop</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
