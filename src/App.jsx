import { useState, useEffect } from 'react'
import './App.css'
import SplitsChart from './SplitsChart'

const API_BASE_URL = 'https://ff4blbpgd1.execute-api.ap-southeast-2.amazonaws.com/items' // Set this to your Lambda API endpoint (e.g., 'https://your-api-id.execute-api.region.amazonaws.com/stage')

// Global storage for FTMS race data
window.ftmsRaceData = null

function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(2)
  return `${mins}:${secs.padStart(5, '0')}`
}

function transformLambdaData(lambdaData) {
  // lambdaData comes directly from DynamoDB
  // It should have: id, timestamp, records (array)
  
  const records = lambdaData.records || []
  
  // Transform records into leaderboard
  const players = records
    .sort((a, b) => (a.finishTimeSec || Infinity) - (b.finishTimeSec || Infinity))
    .map((record, idx) => ({
      id: `p${idx}`,
      playerIndex: record.playerIndex || idx,
      name: record.playerName,
      rank: idx + 1,
      totalDistance: record.totalDistanceM,
      totalTime: formatSeconds(record.finishTimeSec),
      avgSpeed: record.avgSpeedKmh,
      heartRate: record.finalHeartRate,
      calories: record.finalCalories
    }))
  
  return {
    timestamp: lambdaData.timestamp,
    records: records,
    players: players
  }
}

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadRaceData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const id = urlParams.get('id')

        if (!id) {
          setError('No race ID found in URL. Add ?id=<session_id> to the URL.')
          return
        }

        if (!API_BASE_URL) {
          setError('API endpoint not configured. Set API_BASE_URL in the code.')
          return
        }

        setLoading(true)
        const url = `${API_BASE_URL}?id=${encodeURIComponent(id)}`
        const response = await fetch(url)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Session not found')
          }
          throw new Error(`API error: ${response.status}`)
        }

        const raceData = await response.json()
        
        // Transform Lambda response into app format
        const transformedData = transformLambdaData(raceData)
        
        window.ftmsRaceData = transformedData
        setData(transformedData)
        setError(null)
      } catch (err) {
        setError(`Failed to load data: ${err.message}`)
        console.error('Error loading race data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRaceData()
  }, [])

  return (
    <div className="app">
      <header>
        <h1>FTMS Race Leaderboard</h1>
        <p>Real-time race data from FTMS system</p>
      </header>

      <main>
        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <p>Loading race data...</p>
          </div>
        )}

        {data && !loading && (
          <>
            <div className="data-info">
              <h2>Race Results</h2>
              <p className="timestamp">
                {data.timestamp && new Date(data.timestamp).toLocaleString()}
              </p>

              <div className="info-grid">
                <div className="info-card">
                  <strong>Players</strong>
                  <span>{data.players?.length || 0}</span>
                </div>
                <div className="info-card">
                  <strong>Total Records</strong>
                  <span>{data.records?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <section className="chart-section">
              <SplitsChart records={data.records} />
            </section>

            {/* Leaderboard */}
            <section className="leaderboard">
              <h3>Final Standings</h3>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Finish Time</th>
                    <th>Distance</th>
                    <th>Avg Speed</th>
                    <th>HR</th>
                    <th>Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {data.players?.map((player, idx) => (
                    <tr key={player.id} className={idx === 0 ? 'winner' : ''}>
                      <td>#{player.rank}</td>
                      <td>{player.name}</td>
                      <td>{player.totalTime}</td>
                      <td>{player.totalDistance}m</td>
                      <td>{player.avgSpeed?.toFixed(2) || 'N/A'} km/h</td>
                      <td>{player.heartRate} bpm</td>
                      <td>{player.calories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Individual Records */}
            <section className="splits">
              <h3>Detailed Player Stats</h3>
              <div className="splits-detail-grid">
                {data.records?.map((record, idx) => (
                  <div key={idx} className="record-detail-card">
                    <h4>{record.playerName}</h4>
                    <div className="detail-stats">
                      <div className="stat-row">
                        <span>Player Index</span>
                        <span className="value">#{record.playerIndex + 1}</span>
                      </div>
                      <div className="stat-row">
                        <span>Finish Time</span>
                        <span className="value">{formatSeconds(record.finishTimeSec)}</span>
                      </div>
                      <div className="stat-row">
                        <span>Total Distance</span>
                        <span className="value">{record.totalDistanceM}m</span>
                      </div>
                      <div className="stat-row">
                        <span>Avg Speed</span>
                        <span className="value">{record.avgSpeedKmh.toFixed(2)} km/h</span>
                      </div>
                      <div className="stat-row">
                        <span>Final Heart Rate</span>
                        <span className="value">{record.finalHeartRate} bpm</span>
                      </div>
                      <div className="stat-row">
                        <span>Total Calories</span>
                        <span className="value">{record.finalCalories}</span>
                      </div>
                      <div className="stat-row">
                        <span>Splits Recorded</span>
                        <span className="value">{record.splits?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {!data && !error && !loading && (
          <div className="instructions">
            <h3>How to use</h3>
            <p>Access race data by adding the race ID to the URL:</p>
            <code>http://localhost:5173/?id=your-race-id</code>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
