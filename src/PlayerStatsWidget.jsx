import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

const COLORS = [
  '#00d4ff',
  '#7b2cbf',
  '#ff006e',
  '#ffbe0b',
  '#8338ec'
]

function PlayerStatsWidget({ records }) {
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0)

  if (!records || records.length === 0) {
    return <div>No player data available</div>
  }

  const selectedPlayer = records[selectedPlayerIdx]

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
    <div className="player-stats-widget">
      <div className="widget-header">
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
          <ResponsiveContainer width="100%" aspectRatio={1.2}>
            <PieChart>
              <Pie
                data={zoneData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={45}
                fill="#8884d8"
                dataKey="value"
              >
                {zoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ paddingTop: '2px', fontSize: '11px' }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default PlayerStatsWidget
