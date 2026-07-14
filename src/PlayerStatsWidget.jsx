import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import Odometer from './Odometer'

const COLORS = [
  '#00d4ff',
  '#7b2cbf',
  '#ff006e',
  '#ffbe0b',
  '#8338ec'
]

// Estimate max calories based on time (approx 1000 kcal/hr for intense activity)
function estimateMaxCalories(splits) {
  if (!splits || splits.length === 0) return 1000
  // Use last split's gameTimeSec as duration, convert to hours
  const durationHours = (splits[splits.length - 1].gameTimeSec || 1) / 3600
  return Math.max(100, Math.round(durationHours * 1000))
}

function PlayerStatsWidget({ records }) {
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0)

  if (!records || records.length === 0) {
    return <div>No player data available</div>
  }

  const selectedPlayer = records[selectedPlayerIdx]
  const maxCalories = estimateMaxCalories(selectedPlayer.splits || [])
  const caloriesPercent = Math.min(100, Math.round((selectedPlayer.finalCalories / maxCalories) * 100))

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
          <span className="player-name"><Odometer value={selectedPlayer.playerName} /></span>
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
        <div className="widget widget-calorie">
          <div className="widget-label">Calories</div>
          <div className="calorie-chart-wrapper">
            <div className="calorie-chart" style={{ width: '100%', height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ name: 'Burned', value: caloriesPercent }, { name: 'Remaining', value: 100 - caloriesPercent }]}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={20}
                    outerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                    label={false}
                  >
                    <Cell fill="#00d4ff" />
                    <Cell fill="#303030" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="calorie-percent">{caloriesPercent}%</div>
            <div className="calorie-info">
              <div className="calorie-burned"><Odometer value={selectedPlayer.finalCalories} /> kcal</div>
              <div className="calorie-max">Max: {maxCalories}</div>
            </div>
          </div>
        </div>

        <div className="widget">
          <div className="widget-label">Total Distance</div>
          <div className="widget-value"><Odometer value={`${selectedPlayer.totalDistanceM}m`} /></div>
        </div>

        <div className="widget">
          <div className="widget-label">Avg Heart Rate</div>
          <div className="widget-value">
            <Odometer value={
              selectedPlayer.splits && selectedPlayer.splits.length > 0
                ? `${(selectedPlayer.splits.reduce((sum, s) => sum + s.heartRate, 0) / selectedPlayer.splits.length).toFixed(0)} bpm`
                : 'N/A'
            } />
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
