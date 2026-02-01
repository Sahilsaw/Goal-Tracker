import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { DailyStats } from '../../lib/analytics'

interface WeeklyChartProps {
  data: DailyStats[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  // Get today's date key for highlighting
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="weekly-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis 
            dataKey="dayLabel" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#888' }}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value} tasks`, 'Completed']}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="completed" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell 
                key={entry.date} 
                fill={entry.date === todayKey ? '#0d6efd' : '#c4c4c4'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
