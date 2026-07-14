import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Background from './Background.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div id="background">
          <Background />
          </div>
    <div className="allContent">
    <App />
    <div id="settings"></div>
    </div>
  </StrictMode>,
)
