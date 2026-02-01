import './ProgressRing.css'

interface ProgressRingProps {
  done: number
  total: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ProgressRing({
  done,
  total,
  size = 56,
  strokeWidth = 5,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? done / total : 0
  const strokeDashoffset = circumference * (1 - pct)

  return (
    <div className="progress-ring-wrap" title={label ?? `${done}/${total} tasks`}>
      <svg
        className="progress-ring-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="progress-ring-text" aria-hidden>
        {done}/{total}
      </span>
    </div>
  )
}
