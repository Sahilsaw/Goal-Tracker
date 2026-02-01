import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import './Landing.css'

function generateSlug(): string {
  return crypto.randomUUID().slice(0, 8)
}

export function Landing() {
  const navigate = useNavigate()

  const handleCreate = () => {
    const slug = generateSlug()
    navigate(`/g/${slug}`, { replace: true })
  }

  return (
    <div className="landing">
      <div className="landing-theme">
        <ThemeToggle />
      </div>
      <div className="landing-content">
        <div className="landing-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1>Daily Coding Goals</h1>
        <p>
          Track your learning journey. Add videos to watch, DSA questions to solve, 
          and dev tasks to complete. Share your board with a friend and stay accountable.
        </p>
        <div className="landing-features">
          <div className="landing-feature">
            <span className="landing-feature-icon">📺</span>
            <span>Videos</span>
          </div>
          <div className="landing-feature">
            <span className="landing-feature-icon">🧩</span>
            <span>DSA</span>
          </div>
          <div className="landing-feature">
            <span className="landing-feature-icon">💻</span>
            <span>Dev Tasks</span>
          </div>
        </div>
        <button type="button" className="create-board-btn" onClick={handleCreate}>
          Create My Board
        </button>
      </div>
    </div>
  )
}
