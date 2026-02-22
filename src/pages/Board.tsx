import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DayGoalView } from '../components/DayGoalView'
import { DateNavigator } from '../components/DateNavigator'
import { Sidebar } from '../components/Sidebar'
import { AnimeCelebration } from '../components/AnimeCelebration'
import { DailyQuote } from '../components/DailyQuote'
import { useGoals } from '../hooks/useGoals'
import { isDayCompleted } from '../lib/streaks'
import { fireDayCompleteCelebration, shouldUseAnimeCelebration } from '../lib/celebration'
import { isPastDate } from '../lib/integrity'
import type { SectionKind, DsaItem, Difficulty, DsaPlatform } from '../types'
import '../App.css'
import './Board.css'

function formatTodayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dayDoneTotal(dayGoal: { videos: { done: boolean }[]; dsa: { done: boolean }[]; dev: { done: boolean }[]; habits?: { done: boolean }[] }) {
  const habits = dayGoal.habits || []
  const done =
    dayGoal.videos.filter((v) => v.done).length +
    dayGoal.dsa.filter((d) => d.done).length +
    dayGoal.dev.filter((d) => d.done).length +
    habits.filter((h) => h.done).length
  const total = dayGoal.videos.length + dayGoal.dsa.length + dayGoal.dev.length + habits.length
  return { done, total }
}

export function Board() {
  const { slug } = useParams<{ slug: string }>()
  const [dateKey, setDateKey] = useState(formatTodayKey)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { 
    goals, 
    getDayGoal, 
    addItem, 
    toggleDone, 
    removeItem,
    updateDsaItem,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    updateNotes,
    addNoteFile,
    removeNoteFile,
    addHabit,
    toggleHabit,
    removeHabit,
    loading, 
    error 
  } = useGoals(slug ?? null)
  const dayGoal = getDayGoal(dateKey)
  const { done: dayDone, total: dayTotal } = dayDoneTotal(dayGoal)
  const wasDayCompleteRef = useRef<boolean | null>(null)
  const [showAnimeCelebration, setShowAnimeCelebration] = useState(false)

  useEffect(() => {
    const nowComplete = isDayCompleted(dayGoal)
    if (wasDayCompleteRef.current === null) {
      wasDayCompleteRef.current = nowComplete
      return
    }
    if (nowComplete && !wasDayCompleteRef.current && dayTotal > 0) {
      // Check if anime celebration is available, otherwise use confetti
      if (shouldUseAnimeCelebration()) {
        setShowAnimeCelebration(true)
      } else {
        fireDayCompleteCelebration()
      }
    }
    wasDayCompleteRef.current = nowComplete
  }, [dayGoal, dayTotal])

  const handleCloseCelebration = useCallback(() => {
    setShowAnimeCelebration(false)
  }, [])

  const handleAdd = useCallback(
    (kind: SectionKind, payload: { 
      title: string
      url?: string
      link?: string
      platform?: DsaPlatform
      difficulty?: Difficulty
      notes?: string
    }) => {
      addItem(dateKey, kind, payload)
    },
    [dateKey, addItem]
  )

  const handleToggle = useCallback(
    (kind: SectionKind, id: string) => {
      toggleDone(dateKey, kind, id)
    },
    [dateKey, toggleDone]
  )

  const handleRemove = useCallback(
    (kind: SectionKind, id: string) => {
      removeItem(dateKey, kind, id)
    },
    [dateKey, removeItem]
  )

  const handleUpdateDsa = useCallback(
    (id: string, updates: Partial<DsaItem>) => {
      updateDsaItem(dateKey, id, updates)
    },
    [dateKey, updateDsaItem]
  )

  const handleAddSubtask = useCallback(
    (devItemId: string, title: string) => {
      addSubtask(dateKey, devItemId, title)
    },
    [dateKey, addSubtask]
  )

  const handleToggleSubtask = useCallback(
    (devItemId: string, subtaskId: string) => {
      toggleSubtask(dateKey, devItemId, subtaskId)
    },
    [dateKey, toggleSubtask]
  )

  const handleRemoveSubtask = useCallback(
    (devItemId: string, subtaskId: string) => {
      removeSubtask(dateKey, devItemId, subtaskId)
    },
    [dateKey, removeSubtask]
  )

  const handleDateSelect = useCallback((newDate: string) => {
    setDateKey(newDate)
    setSidebarOpen(false)
  }, [])

  const handleUpdateNotes = useCallback(
    (text: string) => {
      updateNotes(dateKey, text)
    },
    [dateKey, updateNotes]
  )

  const handleAddFile = useCallback(
    async (file: File) => {
      await addNoteFile(dateKey, file)
    },
    [dateKey, addNoteFile]
  )

  const handleRemoveFile = useCallback(
    async (fileId: string) => {
      await removeNoteFile(dateKey, fileId)
    },
    [dateKey, removeNoteFile]
  )

  const handleAddHabit = useCallback(
    (title: string, icon?: string) => {
      addHabit(dateKey, title, icon)
    },
    [dateKey, addHabit]
  )

  const handleToggleHabit = useCallback(
    (habitId: string) => {
      toggleHabit(dateKey, habitId)
    },
    [dateKey, toggleHabit]
  )

  const handleRemoveHabit = useCallback(
    (habitId: string) => {
      removeHabit(dateKey, habitId)
    },
    [dateKey, removeHabit]
  )

  if (loading) {
    return (
      <div className="board-layout">
        <div className="board-loading">
          <p>Loading board…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="board-layout">
        <div className="board-error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="board-layout">
      {/* Mobile menu button */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span className="mobile-menu-icon" />
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <Sidebar
        goals={goals}
        slug={slug ?? null}
        dayDone={dayDone}
        dayTotal={dayTotal}
        currentDateKey={dateKey}
        onDateSelect={handleDateSelect}
        isOpen={sidebarOpen}
        notes={dayGoal.notes ?? ''}
        noteFiles={dayGoal.noteFiles ?? []}
        onUpdateNotes={handleUpdateNotes}
        onAddFile={handleAddFile}
        onRemoveFile={handleRemoveFile}
      />

      <main className="board-main">
        <header className="board-header">
          <DailyQuote />
          <DateNavigator currentDateKey={dateKey} onDateChange={setDateKey} />
          {isPastDate(dateKey) && (
            <div className="past-date-warning" role="alert">
              <span className="past-date-warning-icon">⚠️</span>
              <span>You're viewing a past date. Changes will be marked as late completions.</span>
            </div>
          )}
        </header>
        <div className="board-content">
          <DayGoalView
            dayGoal={dayGoal}
            dateKey={dateKey}
            onToggle={handleToggle}
            onRemove={handleRemove}
            onAdd={handleAdd}
            onUpdateDsa={handleUpdateDsa}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onRemoveSubtask={handleRemoveSubtask}
            onToggleHabit={handleToggleHabit}
            onRemoveHabit={handleRemoveHabit}
            onAddHabit={handleAddHabit}
          />
        </div>
      </main>

      {/* Anime celebration popup */}
      <AnimeCelebration 
        visible={showAnimeCelebration} 
        onClose={handleCloseCelebration} 
      />
    </div>
  )
}
