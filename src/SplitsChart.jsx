import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = [
  '#00d4ff',
  '#7b2cbf',
  '#ff006e',
  '#ffbe0b',
  '#8338ec',
  '#3a86ff',
  '#06ffa5'
]

const METRICS = [
  { key: 'speedKmh', label: 'Speed (km/h)', unit: 'km/h' },
  { key: 'heartRate', label: 'Heart Rate (bpm)', unit: 'bpm' },
  { key: 'calories', label: 'Calories', unit: 'cal' },
  { key: 'incline', label: 'Incline (%)', unit: '%' }
]

function SplitsChart({ records }) {
  const [selectedMetric, setSelectedMetric] = useState('speedKmh')

  if (!records || records.length === 0) {
    return <div>No split data available</div>
  }

  // Prepare data for chart - each record's splits
  const chartData = []
  const maxSplits = Math.max(...records.map(r => r.splits?.length || 0))

  for (let i = 0; i < maxSplits; i++) {
    const dataPoint = { lapCount: i + 1 }
    records.forEach((record, idx) => {
      if (record.splits && record.splits[i]) {
        const split = record.splits[i]
        dataPoint[`player${idx}`] = split[selectedMetric] || 0
      }
    })
    chartData.push(dataPoint)
  }

  const metric = METRICS.find(m => m.key === selectedMetric)

  return (
    <div className="splits-chart-container">
      <div className="chart-controls">
        <h3>Race Metrics</h3>
        <div className="metric-toggles">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`metric-btn ${selectedMetric === m.key ? 'active' : ''}`}
              title={m.label}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#303030" />
            <XAxis
              dataKey="lapCount"
              label={{ value: 'Lap Number', position: 'insideBottomRight', offset: -5 }}
              stroke="#8892b0"
            />
            <YAxis
              label={{ value: `${metric.label}`, angle: -90, position: 'insideLeft' }}
              stroke="#8892b0"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e1e1e',
                border: '1px solid #303030',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry) => {
                const playerNum = value.replace('player', '')
                const player = records[playerNum]
                return player ? player.playerName : value
              }}
            />
            {records.map((record, idx) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={`player${idx}`}
                stroke={COLORS[idx % COLORS.length]}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={`player${idx}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <h4>Players</h4>
        <div className="legend-items">
          {records.map((record, idx) => (
            <div key={idx} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span>{record.playerName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SplitsChart
