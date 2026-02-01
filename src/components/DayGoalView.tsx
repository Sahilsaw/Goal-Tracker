import { GoalSection } from './GoalSection'
import type { DayGoal, SectionKind, DsaItem, Difficulty, DsaPlatform } from '../types'

interface DayGoalViewProps {
  dayGoal: DayGoal
  dateKey: string  // The assigned date for integrity tracking
  onToggle: (kind: SectionKind, id: string) => void
  onRemove: (kind: SectionKind, id: string) => void
  onAdd: (
    kind: SectionKind,
    payload: { 
      title: string
      url?: string
      link?: string
      platform?: DsaPlatform
      difficulty?: Difficulty
      notes?: string
    }
  ) => void
  // DSA specific
  onUpdateDsa: (id: string, updates: Partial<DsaItem>) => void
  // Dev subtask methods
  onAddSubtask: (devItemId: string, title: string) => void
  onToggleSubtask: (devItemId: string, subtaskId: string) => void
  onRemoveSubtask: (devItemId: string, subtaskId: string) => void
}

export function DayGoalView({ 
  dayGoal, 
  dateKey,
  onToggle, 
  onRemove, 
  onAdd,
  onUpdateDsa,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
}: DayGoalViewProps) {
  const videosDone = dayGoal.videos.filter((v) => v.done).length
  const dsaDone = dayGoal.dsa.filter((d) => d.done).length
  const devDone = dayGoal.dev.filter((d) => d.done).length
  const hasAnyGoals =
    dayGoal.videos.length > 0 || dayGoal.dsa.length > 0 || dayGoal.dev.length > 0

  return (
    <div className="day-goal-view">
      {!hasAnyGoals ? (
        <div className="day-empty" role="status">
          <p>No goals for this day yet.</p>
          <p className="day-empty-hint">Add videos, DSA questions, or dev tasks below.</p>
        </div>
      ) : null}
      <GoalSection
        title="Videos"
        kind="videos"
        items={dayGoal.videos}
        dateKey={dateKey}
        doneCount={videosDone}
        totalCount={dayGoal.videos.length}
        onToggle={(id) => onToggle('videos', id)}
        onRemove={(id) => onRemove('videos', id)}
        onAdd={(p) => onAdd('videos', p)}
      />
      <GoalSection
        title="DSA Questions"
        kind="dsa"
        items={dayGoal.dsa}
        dateKey={dateKey}
        doneCount={dsaDone}
        totalCount={dayGoal.dsa.length}
        onToggle={(id) => onToggle('dsa', id)}
        onRemove={(id) => onRemove('dsa', id)}
        onAdd={(p) => onAdd('dsa', p)}
        onUpdateDsa={onUpdateDsa}
      />
      <GoalSection
        title="Dev Tasks"
        kind="dev"
        items={dayGoal.dev}
        dateKey={dateKey}
        doneCount={devDone}
        totalCount={dayGoal.dev.length}
        onToggle={(id) => onToggle('dev', id)}
        onRemove={(id) => onRemove('dev', id)}
        onAdd={(p) => onAdd('dev', p)}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
        onRemoveSubtask={onRemoveSubtask}
      />
    </div>
  )
}
