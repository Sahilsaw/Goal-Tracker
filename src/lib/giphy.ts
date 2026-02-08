import { GiphyFetch } from '@giphy/js-fetch-api'

// Initialize Giphy client with API key from environment
const apiKey = import.meta.env.VITE_GIPHY_API_KEY as string | undefined

// Only create client if API key is available
const gf = apiKey ? new GiphyFetch(apiKey) : null

// Search terms for anime celebration GIFs (focused on JJK/Jujutsu Kaisen)
const ANIME_SEARCH_TERMS = [
  'gojo satoru',
  'gojo jjk',
  'jujutsu kaisen gojo',
  'gojo happy',
  'gojo smile',
  'jujutsu kaisen celebration',
  'jjk anime reaction',
  'satoru gojo cool',
  'gojo thumbs up',
  'jjk happy'
]

// Congratulations messages to rotate through (with some JJK flair)
export const CONGRATS_MESSAGES = [
  'Amazing work today!',
  'You crushed it!',
  'Throughout Heaven and Earth, you alone are the honored one!',
  'Nah, I\'d win! And you did!',
  'Goals complete! You\'re a star!',
  'Domain Expansion: Infinite Productivity!',
  'You\'re the strongest today!',
  'Keep up the great work!',
  'With this treasure, I summon victory!',
  'Mission accomplished!',
  'Limitless potential unlocked!'
]

export interface AnimeCelebrationGif {
  url: string
  width: number
  height: number
  title: string
}

/**
 * Check if Giphy API is configured
 */
export function isGiphyConfigured(): boolean {
  return !!apiKey && apiKey !== 'your-giphy-api-key'
}

/**
 * Get a random congratulations message
 */
export function getRandomCongratsMessage(): string {
  const index = Math.floor(Math.random() * CONGRATS_MESSAGES.length)
  return CONGRATS_MESSAGES[index]
}

/**
 * Fetch a random anime celebration GIF from Giphy
 */
export async function fetchRandomAnimeCelebrationGif(): Promise<AnimeCelebrationGif | null> {
  if (!gf) {
    console.warn('Giphy API key not configured')
    return null
  }

  try {
    // Pick a random search term
    const searchTerm = ANIME_SEARCH_TERMS[Math.floor(Math.random() * ANIME_SEARCH_TERMS.length)]
    
    // Fetch GIFs with the search term
    const { data } = await gf.search(searchTerm, {
      limit: 25,
      type: 'gifs',
      rating: 'g' // Keep it family-friendly
    })

    if (data.length === 0) {
      console.warn('No GIFs found for search term:', searchTerm)
      return null
    }

    // Pick a random GIF from results
    const randomGif = data[Math.floor(Math.random() * data.length)]
    
    // Use fixed_height for consistent sizing and better performance
    const fixedHeight = randomGif.images.fixed_height
    
    return {
      url: fixedHeight.url,
      width: Number(fixedHeight.width),
      height: Number(fixedHeight.height),
      title: randomGif.title || 'Celebration!'
    }
  } catch (error) {
    console.error('Error fetching GIF from Giphy:', error)
    return null
  }
}
