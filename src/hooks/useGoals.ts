import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { DayGoal, GoalsByDate, SectionKind, DsaItem, Subtask, Difficulty, DsaPlatform } from '../types'

function emptyDayGoal(date: string): DayGoal {
  return { date, videos: [], dsa: [], dev: [] }
}

function getOrCreateDay(goals: GoalsByDate, date: string): DayGoal {
  const existing = goals[date]
  if (existing)
    return {
      ...existing,
      videos: [...existing.videos],
      dsa: [...existing.dsa.map(d => ({ ...d }))],
      dev: [...existing.dev.map(d => ({ ...d, subtasks: d.subtasks ? [...d.subtasks] : [] }))],
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
      if (kind === 'videos') {
        day.videos = day.videos.map((v) => (v.id === id ? { ...v, done: !v.done } : v))
      } else if (kind === 'dsa') {
        day.dsa = day.dsa.map((d) => (d.id === id ? { ...d, done: !d.done } : d))
      } else {
        day.dev = day.dev.map((d) => (d.id === id ? { ...d, done: !d.done } : d))
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
      day.dev = day.dev.map((d) => {
        if (d.id !== devItemId) return d
        const updatedSubtasks = (d.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        )
        // Auto-complete parent if all subtasks are done
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.done)
        return { ...d, subtasks: updatedSubtasks, done: allDone }
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
    loading, 
    error 
  }
}
