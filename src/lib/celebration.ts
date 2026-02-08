import confetti from 'canvas-confetti'
import { isGiphyConfigured } from './giphy'

/**
 * Check if anime celebration should be used (Giphy API configured)
 */
export function shouldUseAnimeCelebration(): boolean {
  return isGiphyConfigured()
}

/**
 * Fire confetti celebration (fallback when Giphy not configured)
 */
export function fireConfettiCelebration(): void {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
  })
}

/**
 * Legacy function - now triggers confetti as fallback
 * The Board component handles anime celebration separately
 */
export function fireDayCompleteCelebration(): void {
  // Only fire confetti if anime celebration is not available
  if (!shouldUseAnimeCelebration()) {
    fireConfettiCelebration()
  }
}

export function fireStreakCelebration(): void {
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
  })
}
