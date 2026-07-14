import { useState, useEffect } from 'react'
import './App.css'
import SplitsChart from './SplitsChart'
import PlayerStatsWidget from './PlayerStatsWidget'
import Odometer from './Odometer'
import Background from './Background'

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
    <>
      <div className="app">
      <header>
        <div className="header-content">
        <h1>FTMS Race Leaderboard</h1>
        <p>Real-time race data from FTMS system</p>
        </div>
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

            <div className="content-wrapper">
              {/* Left Column: Charts */}
              <div className="left-column">
                <section className="chart-section">
                  <SplitsChart records={data.Records} />
                </section>
              </div>

              {/* Right Column: Leaderboard + Player Stats */}
              <div className="right-column">
                <section className="leaderboard">
                  <h3>Final Standings</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Finish Time</th>
                        <th>HR</th>
                        <th>Calories</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.Records?.map((record, idx) => (
                        <tr key={idx} className={idx === 0 ? 'winner' : ''}>
                          <td><Odometer value={idx + 1} /></td>
                          <td><Odometer value={record.playerName} /></td>
                          <td><Odometer value={formatSeconds(record.finishTimeSec)} /></td>
                          <td><Odometer value={`${record.finalHeartRate} bpm`} /></td>
                          <td><Odometer value={record.finalCalories} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <section className="sidebar-widgets">
                  <PlayerStatsWidget records={data.Records} />
                </section>
              </div>
            </div>
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
    </>
  )
}

export default App
