export interface VideoItem {
  id: string
  title: string
  url: string
  done: boolean
  completedAt?: string  // ISO timestamp when marked done
}

export type DsaPlatform = 'leetcode' | 'hackerrank' | 'codeforces' | 'gfg' | 'other'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DsaItem {
  id: string
  title: string
  link?: string
  platform?: DsaPlatform
  difficulty?: Difficulty
  notes?: string
  timeSpentMinutes?: number
  done: boolean
  completedAt?: string  // ISO timestamp when marked done
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface DevItem {
  id: string
  title: string
  link?: string
  subtasks?: Subtask[]
  done: boolean
  completedAt?: string  // ISO timestamp when marked done
}

export interface NoteFile {
  id: string
  name: string
  url: string
  type: string
  uploadedAt: string
}

export interface DayGoal {
  date: string
  videos: VideoItem[]
  dsa: DsaItem[]
  dev: DevItem[]
  notes?: string
  noteFiles?: NoteFile[]
}

export type GoalsByDate = Record<string, DayGoal>

export type SectionKind = 'videos' | 'dsa' | 'dev'
