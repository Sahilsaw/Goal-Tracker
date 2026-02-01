import type { DsaPlatform } from '../types'

export function detectPlatform(url: string): DsaPlatform | null {
  if (!url) return null
  
  const lower = url.toLowerCase()
  
  if (lower.includes('leetcode.com')) return 'leetcode'
  if (lower.includes('hackerrank.com')) return 'hackerrank'
  if (lower.includes('codeforces.com')) return 'codeforces'
  if (lower.includes('geeksforgeeks.org') || lower.includes('gfg.')) return 'gfg'
  if (lower.includes('codingninjas.com')) return 'other'
  if (lower.includes('interviewbit.com')) return 'other'
  
  // If it looks like a URL but doesn't match known platforms
  if (lower.startsWith('http://') || lower.startsWith('https://')) return 'other'
  
  return null
}

export function getPlatformName(platform: DsaPlatform | null | undefined): string {
  switch (platform) {
    case 'leetcode': return 'LeetCode'
    case 'hackerrank': return 'HackerRank'
    case 'codeforces': return 'Codeforces'
    case 'gfg': return 'GeeksforGeeks'
    case 'other': return 'Other'
    default: return ''
  }
}

export function getPlatformColor(platform: DsaPlatform | null | undefined): string {
  switch (platform) {
    case 'leetcode': return '#ffa116'
    case 'hackerrank': return '#00ea64'
    case 'codeforces': return '#1f8acb'
    case 'gfg': return '#2f8d46'
    case 'other': return '#888'
    default: return '#888'
  }
}

export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard' | undefined): string {
  switch (difficulty) {
    case 'easy': return '#00b8a3'
    case 'medium': return '#ffc01e'
    case 'hard': return '#ff375f'
    default: return '#888'
  }
}

export function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard' | undefined): string {
  switch (difficulty) {
    case 'easy': return 'Easy'
    case 'medium': return 'Medium'
    case 'hard': return 'Hard'
    default: return ''
  }
}
