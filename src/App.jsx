import { useState, useEffect } from 'react'
import './App.css'
import SplitsChart from './SplitsChart'

const API_BASE_URL = 'https://ff4blbpgd1.execute-api.ap-southeast-2.amazonaws.com/items'

window.ftmsRaceData = null

function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(2)
  return `${mins}:${secs.padStart(5, '0')}`
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
        
        // Parse Records if it's a string
        if (typeof raceData.Records === 'string') {
          raceData.Records = JSON.parse(raceData.Records)
        }
        
        window.ftmsRaceData = raceData
        setData(raceData)
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
                {data.Timestamp && new Date(data.Timestamp).toLocaleString()}
              </p>

              <div className="info-grid">
                <div className="info-card">
                  <strong>Players</strong>
                  <span>{data.Records?.length || 0}</span>
                </div>
                <div className="info-card">
                  <strong>Race ID</strong>
                  <span>{data.id}</span>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <section className="chart-section">
              <SplitsChart records={data.Records} />
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
                  {data.Records?.map((record, idx) => (
                    <tr key={idx} className={idx === 0 ? 'winner' : ''}>
                      <td>#{idx + 1}</td>
                      <td>{record.playerName}</td>
                      <td>{formatSeconds(record.finishTimeSec)}</td>
                      <td>{record.totalDistanceM}m</td>
                      <td>{record.avgSpeedKmh?.toFixed(2) || 'N/A'} km/h</td>
                      <td>{record.finalHeartRate} bpm</td>
                      <td>{record.finalCalories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Individual Records */}
            <section className="splits">
              <h3>Detailed Player Stats</h3>
              <div className="splits-detail-grid">
                {data.Records?.map((record, idx) => (
                  <div key={idx} className="record-detail-card">
                    <h4>{record.playerName}</h4>
                    <div className="detail-stats">
                      <div className="stat-row">
                        <span>Player Index</span>
                        <span className="value">#{record.playerIndex}</span>
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
