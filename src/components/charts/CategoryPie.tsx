import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategoryStats } from '../../lib/analytics'

interface CategoryPieProps {
  data: CategoryStats
}

const COLORS = {
  videos: '#ef4444',  // red
  dsa: '#22c55e',     // green
  dev: '#3b82f6',     // blue
}

export function CategoryPie({ data }: CategoryPieProps) {
  const chartData = [
    { name: 'Videos', value: data.videos, color: COLORS.videos },
    { name: 'DSA', value: data.dsa, color: COLORS.dsa },
    { name: 'Dev', value: data.dev, color: COLORS.dev },
  ].filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="category-pie category-pie-empty">
        <span>No data yet</span>
      </div>
    )
  }

  return (
    <div className="category-pie">
      <div style={{ width: '100%', height: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={35}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`${value}`, String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="category-legend">
        {chartData.map((entry) => (
          <span key={entry.name} className="category-legend-item">
            <span className="category-dot" style={{ background: entry.color }} />
            {entry.value}
          </span>
        ))}
      </div>
    </div>
  )
}
