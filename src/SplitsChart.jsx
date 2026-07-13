import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0)

  if (!records || records.length === 0) {
    return <div>No split data available</div>
  }

  const selectedPlayer = records[selectedPlayerIdx]

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

  // Calculate heart rate zones
  const calculateHeartRateZones = (splits) => {
    const zones = {
      'Zone 1': 0,
      'Zone 2': 0,
      'Zone 3': 0,
      'Zone 4': 0,
      'Zone 5': 0
    }

    splits.forEach(split => {
      const hr = split.heartRate
      if (hr < 110) zones['Zone 1']++
      else if (hr < 128) zones['Zone 2']++
      else if (hr < 147) zones['Zone 3']++
      else if (hr < 165) zones['Zone 4']++
      else zones['Zone 5']++
    })

    return Object.entries(zones).map(([name, value]) => ({ name, value }))
  }

  const zoneData = calculateHeartRateZones(selectedPlayer.splits || [])

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
                dot={false}
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

      {/* Widget Grid */}
      <div className="widgets">
        <div className="widgets-header">
          <h3>Player Stats</h3>
          <div className="player-nav">
            <button
              onClick={() => setSelectedPlayerIdx(Math.max(0, selectedPlayerIdx - 1))}
              disabled={selectedPlayerIdx === 0}
              className="nav-btn"
            >
              ← Previous
            </button>
            <span className="player-name">{selectedPlayer.playerName}</span>
            <button
              onClick={() => setSelectedPlayerIdx(Math.min(records.length - 1, selectedPlayerIdx + 1))}
              disabled={selectedPlayerIdx === records.length - 1}
              className="nav-btn"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="widget-grid">
          <div className="widget">
            <div className="widget-label">Total Calories</div>
            <div className="widget-value">{selectedPlayer.finalCalories}</div>
          </div>

          <div className="widget">
            <div className="widget-label">Total Distance</div>
            <div className="widget-value">{selectedPlayer.totalDistanceM}m</div>
          </div>

          <div className="widget">
            <div className="widget-label">Avg Heart Rate</div>
            <div className="widget-value">
              {selectedPlayer.splits && selectedPlayer.splits.length > 0
                ? (selectedPlayer.splits.reduce((sum, s) => sum + s.heartRate, 0) / selectedPlayer.splits.length).toFixed(0)
                : 'N/A'}
              {' '}bpm
            </div>
          </div>

          <div className="widget widget-chart">
            <div className="widget-label">Heart Rate Zones</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={zoneData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {zoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplitsChart
