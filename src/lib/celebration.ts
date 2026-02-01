import confetti from 'canvas-confetti'

export function fireDayCompleteCelebration(): void {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
  })
}

export function fireStreakCelebration(): void {
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
  })
}
