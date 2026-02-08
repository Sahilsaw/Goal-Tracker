export interface JJKQuote {
  text: string
  character: string
}

// Collection of Jujutsu Kaisen quotes
export const JJK_QUOTES: JJKQuote[] = [
  // Gojo Satoru
  { text: "Throughout Heaven and Earth, I alone am the honored one.", character: "Gojo Satoru" },
  { text: "Dying to win and risking death to win are completely different.", character: "Gojo Satoru" },
  { text: "Nah, I'd win.", character: "Gojo Satoru" },
  { text: "Don't worry. I'm the strongest.", character: "Gojo Satoru" },
  { text: "It's not about whether I can. I have to do it.", character: "Gojo Satoru" },
  { text: "The future will be better. That's what I believe.", character: "Gojo Satoru" },
  { text: "I've always been aستاند alone kind of guy.", character: "Gojo Satoru" },
  { text: "Infinity exists everywhere.", character: "Gojo Satoru" },
  { text: "Are you the strongest because you're Gojo Satoru? Or are you Gojo Satoru because you're the strongest?", character: "Gojo Satoru" },
  { text: "Love is the most twisted curse of all.", character: "Gojo Satoru" },
  
  // Yuji Itadori
  { text: "I'm not gonna lose to some curse!", character: "Yuji Itadori" },
  { text: "I don't know how I'll feel when I'm dead, but I don't want to regret the way I lived.", character: "Yuji Itadori" },
  { text: "I'm gonna kill you. Even if it kills me.", character: "Yuji Itadori" },
  { text: "At least... help me give people a proper death.", character: "Yuji Itadori" },
  { text: "I want to save people, even if it's just one more.", character: "Yuji Itadori" },
  { text: "I'll keep moving forward.", character: "Yuji Itadori" },
  
  // Megumi Fushiguro
  { text: "I want to save people who I think deserve to be saved.", character: "Megumi Fushiguro" },
  { text: "I'm not a hero. I just want to help people I think are worth saving.", character: "Megumi Fushiguro" },
  { text: "With this treasure, I summon...", character: "Megumi Fushiguro" },
  { text: "I refuse to be bound by the rules of others.", character: "Megumi Fushiguro" },
  
  // Nobara Kugisaki
  { text: "I love myself when I'm pretty and ugly!", character: "Nobara Kugisaki" },
  { text: "I'm not gonna let anyone look down on me.", character: "Nobara Kugisaki" },
  { text: "Don't underestimate me just because I'm a girl!", character: "Nobara Kugisaki" },
  { text: "I'll never compromise who I am.", character: "Nobara Kugisaki" },
  
  // Kento Nanami
  { text: "The accumulation of those little despairs is what makes a person an adult.", character: "Kento Nanami" },
  { text: "I hate overtime.", character: "Kento Nanami" },
  { text: "Work is shit. But at least I can curse while doing it.", character: "Kento Nanami" },
  { text: "You don't need a reason to save someone.", character: "Kento Nanami" },
  { text: "Being an adult means having responsibilities.", character: "Kento Nanami" },
  
  // Ryomen Sukuna
  { text: "Know your place, fool.", character: "Ryomen Sukuna" },
  { text: "Stand proud. You were strong.", character: "Ryomen Sukuna" },
  { text: "You dare challenge me?", character: "Ryomen Sukuna" },
  { text: "Pathetic.", character: "Ryomen Sukuna" },
  
  // Todo Aoi
  { text: "What kind of woman is your type?", character: "Todo Aoi" },
  { text: "My best friend!", character: "Todo Aoi" },
  { text: "We are connected by our souls!", character: "Todo Aoi" },
  
  // Toge Inumaki
  { text: "Salmon.", character: "Toge Inumaki" },
  { text: "Tuna mayo.", character: "Toge Inumaki" },
  
  // General inspirational
  { text: "Domain Expansion!", character: "Various Sorcerers" },
  { text: "Cursed energy is the power born from negative emotions.", character: "Jujutsu Philosophy" },
]

/**
 * Get a quote that stays consistent for the entire day
 * Uses a simple hash based on the date
 */
export function getDailyQuote(): JJKQuote {
  const today = new Date()
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  
  // Simple hash function for the date
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % JJK_QUOTES.length
  return JJK_QUOTES[index]
}

/**
 * Get a random quote (for refresh button)
 */
export function getRandomQuote(): JJKQuote {
  const index = Math.floor(Math.random() * JJK_QUOTES.length)
  return JJK_QUOTES[index]
}
