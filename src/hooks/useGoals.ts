import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { uploadFile, deleteFile } from '../lib/storage'
import type { DayGoal, GoalsByDate, SectionKind, DsaItem, Subtask, Difficulty, DsaPlatform, NoteFile, HabitItem } from '../types'

const DEFAULT_HABITS: Omit<HabitItem, 'id'>[] = [
  { title: 'Workout', icon: '💪', done: false },
  { title: 'Walk', icon: '🚶', done: false },
  { title: 'Study 3H', icon: '📚', done: false },
  { title: '2L Water', icon: '💧', done: false },
  { title: 'Sunlight', icon: '☀️', done: false },
  { title: 'Day Skincare', icon: '🧴', done: false },
  { title: 'Night Skincare', icon: '🌙', done: false },
  { title: 'Sleep <1:30 AM', icon: '😴', done: false },
]

function generateDefaultHabits(): HabitItem[] {
  return DEFAULT_HABITS.map((habit, index) => ({
    ...habit,
    id: `default-${index}-${Date.now()}`,
  }))
}

function emptyDayGoal(date: string): DayGoal {
  return { date, videos: [], dsa: [], dev: [], habits: generateDefaultHabits(), notes: '', noteFiles: [] }
}

function getOrCreateDay(goals: GoalsByDate, date: string): DayGoal {
  const existing = goals[date]
  if (existing)
    return {
      ...existing,
      videos: [...existing.videos],
      dsa: [...existing.dsa.map(d => ({ ...d }))],
      dev: [...existing.dev.map(d => ({ ...d, subtasks: d.subtasks ? [...d.subtasks] : [] }))],
      habits: existing.habits ? [...existing.habits.map(h => ({ ...h }))] : [],
      notes: existing.notes ?? '',
      noteFiles: existing.noteFiles ? [...existing.noteFiles] : [],
    }
  return emptyDayGoal(date)
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function fetchGoalsBySlug(slug: string): Promise<GoalsByDate> {
  const { data, error } = await supabase
    .from('day_goals')
    .select('date, data')
    .eq('slug', slug)

  if (error) throw error
  if (!data || data.length === 0) return {}

  const goals: GoalsByDate = {}
  for (const row of data as { date: string; data: DayGoal }[]) {
    goals[row.date] = row.data as DayGoal
  }
  return goals
}

async function upsertDayGoal(slug: string, date: string, dayGoal: DayGoal): Promise<void> {
  const { error } = await supabase.from('day_goals').upsert(
    { slug, date, data: dayGoal },
    { onConflict: 'slug,date' }
  )
  if (error) throw error
}

export function useGoals(slug: string | null) {
  const [goals, setGoals] = useState<GoalsByDate>({})
  const [loading, setLoading] = useState(!!slug)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setGoals({})
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    fetchGoalsBySlug(slug)
      .then(setGoals)
      .catch((e) => setError(e.message ?? 'Failed to load goals'))
      .finally(() => setLoading(false))
  }, [slug])

  const updateDay = useCallback(
    (date: string, dayGoal: DayGoal) => {
      setGoals((prev) => ({ ...prev, [date]: dayGoal }))
      if (slug) {
        upsertDayGoal(slug, date, dayGoal).catch((e) =>
          setError(e.message ?? 'Failed to save')
        )
      }
    },
    [slug]
  )

  const getDayGoal = useCallback(
    (date: string): DayGoal => {
      return getOrCreateDay(goals, date)
    },
    [goals]
  )

  const addItem = useCallback(
    (
      date: string,
      kind: SectionKind,
      payload: { 
        title: string
        url?: string
        link?: string
        platform?: DsaPlatform
        difficulty?: Difficulty
        notes?: string
      }
    ) => {
      const day = getOrCreateDay(goals, date)
      const id = generateId()
      if (kind === 'videos') {
        const url = payload.url ?? ''
        day.videos = [...day.videos, { id, title: payload.title, url, done: false }]
      } else if (kind === 'dsa') {
        day.dsa = [...day.dsa, { 
          id, 
          title: payload.title, 
          link: payload.link,
          platform: payload.platform,
          difficulty: payload.difficulty,
          notes: payload.notes,
          done: false 
        }]
      } else {
        day.dev = [...day.dev, { id, title: payload.title, link: payload.link, subtasks: [], done: false }]
      }
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  const toggleDone = useCallback(
    (date: string, kind: SectionKind, id: string) => {
      const day = getOrCreateDay(goals, date)
      const now = new Date().toISOString()
      
      if (kind === 'videos') {
        day.videos = day.videos.map((v) => {
          if (v.id !== id) return v
          const newDone = !v.done
          return { 
            ...v, 
            done: newDone,
            completedAt: newDone ? now : undefined
          }
        })
      } else if (kind === 'dsa') {
        day.dsa = day.dsa.map((d) => {
          if (d.id !== id) return d
          const newDone = !d.done
          return { 
            ...d, 
            done: newDone,
            completedAt: newDone ? now : undefined
          }
        })
      } else {
        day.dev = day.dev.map((d) => {
          if (d.id !== id) return d
          const newDone = !d.done
          return { 
            ...d, 
            done: newDone,
            completedAt: newDone ? now : undefined
          }
        })
      }
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  const removeItem = useCallback(
    (date: string, kind: SectionKind, id: string) => {
      const day = getOrCreateDay(goals, date)
      if (kind === 'videos') {
        day.videos = day.videos.filter((v) => v.id !== id)
      } else if (kind === 'dsa') {
        day.dsa = day.dsa.filter((d) => d.id !== id)
      } else {
        day.dev = day.dev.filter((d) => d.id !== id)
      }
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  // Update DSA item (for notes, time, etc.)
  const updateDsaItem = useCallback(
    (date: string, id: string, updates: Partial<DsaItem>) => {
      const day = getOrCreateDay(goals, date)
      day.dsa = day.dsa.map((d) => (d.id === id ? { ...d, ...updates } : d))
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  // Subtask methods for Dev items
  const addSubtask = useCallback(
    (date: string, devItemId: string, subtaskTitle: string) => {
      const day = getOrCreateDay(goals, date)
      day.dev = day.dev.map((d) => {
        if (d.id !== devItemId) return d
        const newSubtask: Subtask = { id: generateId(), title: subtaskTitle, done: false }
        return { ...d, subtasks: [...(d.subtasks || []), newSubtask], done: false }
      })
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  const toggleSubtask = useCallback(
    (date: string, devItemId: string, subtaskId: string) => {
      const day = getOrCreateDay(goals, date)
      const now = new Date().toISOString()
      
      day.dev = day.dev.map((d) => {
        if (d.id !== devItemId) return d
        const updatedSubtasks = (d.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        )
        // Auto-complete parent if all subtasks are done
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.done)
        const wasDone = d.done
        return { 
          ...d, 
          subtasks: updatedSubtasks, 
          done: allDone,
          // Set completedAt when auto-completed, clear if uncompleted
          completedAt: allDone && !wasDone ? now : (allDone ? d.completedAt : undefined)
        }
      })
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  const removeSubtask = useCallback(
    (date: string, devItemId: string, subtaskId: string) => {
      const day = getOrCreateDay(goals, date)
      day.dev = day.dev.map((d) => {
        if (d.id !== devItemId) return d
        const updatedSubtasks = (d.subtasks || []).filter((s) => s.id !== subtaskId)
        // Check if all remaining subtasks are done
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.done)
        return { ...d, subtasks: updatedSubtasks, done: updatedSubtasks.length === 0 ? d.done : allDone }
      })
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  // Notes methods
  const updateNotes = useCallback(
    (date: string, text: string) => {
      const day = getOrCreateDay(goals, date)
      day.notes = text
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  const addNoteFile = useCallback(
    async (date: string, file: File): Promise<void> => {
      if (!slug) return
      
      try {
        const { url, path } = await uploadFile(slug, date, file)
        const newFile: NoteFile = {
          id: generateId(),
          name: file.name,
          url,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        }
        // Store the path in the id for deletion later
        newFile.id = path
        
        const day = getOrCreateDay(goals, date)
        day.noteFiles = [...(day.noteFiles || []), newFile]
        updateDay(date, { ...day })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to upload file')
        throw e
      }
    },
    [goals, updateDay, slug]
  )

  const removeNoteFile = useCallback(
    async (date: string, fileId: string): Promise<void> => {
      const day = getOrCreateDay(goals, date)
      const fileToRemove = day.noteFiles?.find((f) => f.id === fileId)
      
      if (fileToRemove) {
        try {
          // fileId is the storage path
          await deleteFile(fileId)
        } catch (e) {
          console.warn('Failed to delete file from storage:', e)
          // Continue anyway to remove from state
        }
      }
      
      day.noteFiles = (day.noteFiles || []).filter((f) => f.id !== fileId)
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  // Habit methods
  const addHabit = useCallback(
    (date: string, title: string, icon?: string) => {
      const day = getOrCreateDay(goals, date)
      const newHabit: HabitItem = {
        id: generateId(),
        title,
        icon,
        done: false,
      }
      day.habits = [...(day.habits || []), newHabit]
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  const toggleHabit = useCallback(
    (date: string, habitId: string) => {
      const day = getOrCreateDay(goals, date)
      const now = new Date().toISOString()
      
      day.habits = (day.habits || []).map((h) => {
        if (h.id !== habitId) return h
        const newDone = !h.done
        return {
          ...h,
          done: newDone,
          completedAt: newDone ? now : undefined,
        }
      })
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  const removeHabit = useCallback(
    (date: string, habitId: string) => {
      const day = getOrCreateDay(goals, date)
      day.habits = (day.habits || []).filter((h) => h.id !== habitId)
      updateDay(date, { ...day })
    },
    [goals, updateDay]
  )

  return { 
    goals, 
    getDayGoal, 
    updateDay, 
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
  }
}
