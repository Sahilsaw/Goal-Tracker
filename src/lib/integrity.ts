/**
 * Check if a task was completed late (on a different day than assigned)
 */
export function isLateCompletion(assignedDate: string, completedAt?: string): boolean {
  if (!completedAt) return false
  
  const assigned = new Date(assignedDate + 'T00:00:00')
  const completed = new Date(completedAt)
  
  // Get the date parts only (ignore time)
  const assignedDay = new Date(assigned.getFullYear(), assigned.getMonth(), assigned.getDate())
  const completedDay = new Date(completed.getFullYear(), completed.getMonth(), completed.getDate())
  
  return completedDay.getTime() > assignedDay.getTime()
}

/**
 * Get the number of days late a completion was
 */
export function getDaysLate(assignedDate: string, completedAt?: string): number {
  if (!completedAt) return 0
  
  const assigned = new Date(assignedDate + 'T00:00:00')
  const completed = new Date(completedAt)
  
  const assignedDay = new Date(assigned.getFullYear(), assigned.getMonth(), assigned.getDate())
  const completedDay = new Date(completed.getFullYear(), completed.getMonth(), completed.getDate())
  
  const diffMs = completedDay.getTime() - assignedDay.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

/**
 * Format the completion date for display
 */
export function formatCompletionDate(completedAt: string): string {
  const date = new Date(completedAt)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Check if a date is in the past (more than 1 day ago)
 */
export function isPastDate(dateKey: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const checkDate = new Date(dateKey + 'T00:00:00')
  checkDate.setHours(0, 0, 0, 0)
  
  // Return true if more than 1 day ago
  const diffMs = today.getTime() - checkDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  
  return diffDays >= 1
}
