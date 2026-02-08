import { getDailyQuote } from '../lib/jjkQuotes'
import './DailyQuote.css'

export function DailyQuote() {
  const quote = getDailyQuote()

  return (
    <div className="daily-quote">
      <div className="daily-quote-decoration">&#x300A;</div>
      <div className="daily-quote-content">
        <p className="daily-quote-text">"{quote.text}"</p>
        <p className="daily-quote-character">— {quote.character}</p>
      </div>
      <div className="daily-quote-decoration">&#x300B;</div>
    </div>
  )
}
