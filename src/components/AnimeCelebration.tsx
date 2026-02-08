import { useEffect, useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { 
  fetchRandomAnimeCelebrationGif, 
  getRandomCongratsMessage, 
  isGiphyConfigured,
  type AnimeCelebrationGif 
} from '../lib/giphy'
import './AnimeCelebration.css'

interface AnimeCelebrationProps {
  visible: boolean
  onClose: () => void
}

export function AnimeCelebration({ visible, onClose }: AnimeCelebrationProps) {
  const [gif, setGif] = useState<AnimeCelebrationGif | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [exiting, setExiting] = useState(false)

  const handleClose = useCallback(() => {
    setExiting(true)
    // Wait for exit animation to complete
    setTimeout(() => {
      setExiting(false)
      setGif(null)
      onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    if (!visible) return

    // Check if Giphy is configured
    if (!isGiphyConfigured()) {
      console.warn('Giphy API not configured, skipping anime celebration')
      onClose()
      return
    }

    // Fetch a new GIF and message
    setLoading(true)
    setMessage(getRandomCongratsMessage())

    fetchRandomAnimeCelebrationGif()
      .then((result) => {
        if (result) {
          setGif(result)
          // Fire confetti celebration alongside the anime popup
          fireConfetti()
        } else {
          // No GIF available, close immediately
          onClose()
        }
      })
      .catch(() => {
        onClose()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [visible, onClose])

  // Fire confetti burst effect
  const fireConfetti = () => {
    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Second burst after a small delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      })
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      })
    }, 200)
  }

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!visible || !gif) return

    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [visible, gif, handleClose])

  if (!visible || (!gif && !loading)) {
    return null
  }

  return (
    <div className={`anime-celebration ${exiting ? 'exiting' : ''}`}>
      <div className="anime-celebration-card">
        <button 
          type="button" 
          className="anime-celebration-close"
          onClick={handleClose}
          aria-label="Close celebration"
        >
          ×
        </button>
        
        <div className="anime-celebration-content">
          {loading ? (
            <div className="anime-celebration-loading">
              <div className="anime-celebration-spinner" />
            </div>
          ) : gif ? (
            <img 
              src={gif.url} 
              alt={gif.title}
              className="anime-celebration-gif"
              style={{ maxWidth: Math.min(gif.width, 200), maxHeight: Math.min(gif.height, 200) }}
            />
          ) : null}
          
          <div className="anime-celebration-message">
            <span className="anime-celebration-star">★</span>
            <span className="anime-celebration-text">{message}</span>
            <span className="anime-celebration-star">★</span>
          </div>
        </div>
        
      </div>
    </div>
  )
}
