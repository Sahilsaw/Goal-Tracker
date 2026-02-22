import { useState } from 'react'
import { GoalSection } from './GoalSection'
import { HabitsSection } from './HabitsSection'
import type { DayGoal, SectionKind, DsaItem, Difficulty, DsaPlatform } from '../types'
import './DayGoalTabs.css'

type TabId = 'coding' | 'habits'

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
  // Habit methods
  onToggleHabit: (habitId: string) => void
  onRemoveHabit: (habitId: string) => void
  onAddHabit: (title: string, icon?: string) => void
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
  onToggleHabit,
  onRemoveHabit,
  onAddHabit,
}: DayGoalViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('coding')
  
  const videosDone = dayGoal.videos.filter((v) => v.done).length
  const dsaDone = dayGoal.dsa.filter((d) => d.done).length
  const devDone = dayGoal.dev.filter((d) => d.done).length
  const habits = dayGoal.habits || []
  const habitsDone = habits.filter((h) => h.done).length
  
  const codingTotal = dayGoal.videos.length + dayGoal.dsa.length + dayGoal.dev.length
  const codingDone = videosDone + dsaDone + devDone
  const habitsTotal = habits.length

  return (
    <div className="day-goal-view">
      <div className="day-goal-tabs">
        <button
          type="button"
          className={`day-goal-tab ${activeTab === 'coding' ? 'active' : ''}`}
          onClick={() => setActiveTab('coding')}
        >
          <span className="tab-icon">💻</span>
          <span className="tab-label">Coding Goals</span>
          {codingTotal > 0 && (
            <span className="tab-badge">{codingDone}/{codingTotal}</span>
          )}
        </button>
        <button
          type="button"
          className={`day-goal-tab ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          <span className="tab-icon">🎯</span>
          <span className="tab-label">Daily Habits</span>
          {habitsTotal > 0 && (
            <span className="tab-badge">{habitsDone}/{habitsTotal}</span>
          )}
        </button>
      </div>

      <div className="day-goal-tab-content">
        {activeTab === 'coding' && (
          <div className="tab-panel">
            {codingTotal === 0 && (
              <div className="day-empty" role="status">
                <p>No coding goals for this day yet.</p>
                <p className="day-empty-hint">Add videos, DSA questions, or dev tasks below.</p>
              </div>
            )}
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
        )}

        {activeTab === 'habits' && (
          <div className="tab-panel">
            <HabitsSection
              habits={habits}
              onToggle={onToggleHabit}
              onRemove={onRemoveHabit}
              onAdd={onAddHabit}
            />
          </div>
        )}
      </div>
    </div>
  )
}
