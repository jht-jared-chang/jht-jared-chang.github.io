import { useState, useEffect } from 'react'
import * as pako from 'pako'

// Helper functions using native encoding
function compressToBase64(data) {
  const jsonString = JSON.stringify(data)
  const compressed = pako.gzip(jsonString)
  let binary = ''
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i])
  }
  return btoa(binary)
}

function decompressFromBase64(base64String) {
  try {
    const binaryString = atob(base64String)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const decompressed = pako.inflate(bytes)
    return JSON.parse(new TextDecoder().decode(decompressed))
  } catch (err) {
    throw new Error(`Failed to decompress data: ${err.message}`)
  }
}

function UrlGenerator({ data }) {
  const [inputData, setInputData] = useState('')
  const [encodedUrl, setEncodedUrl] = useState('')
  const [useCompression, setUseCompression] = useState(true)
  const [compressedData, setCompressedData] = useState(null)

  // Initialize with the passed data prop
  useEffect(() => {
    if (data) {
      setInputData(JSON.stringify(data, null, 2))
    }
  }, [data])

  const generateUrl = () => {
    try {
      const parsedData = JSON.parse(inputData)
      
      if (useCompression) {
        const base64 = compressToBase64(parsedData)
        const url = `${window.location.origin}${window.location.pathname}?d=${base64}`
        setEncodedUrl(url)
      } else {
        const encoded = encodeURIComponent(inputData)
        const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`
        setEncodedUrl(url)
      }
    } catch (err) {
      setEncodedUrl(`Invalid JSON: ${err.message}`)
    }
  }

  return (
    <div className="url-generator">
      <h3>Generate Shareable URL</h3>
      
      <div className="compression-toggle">
        <label>
          <input
            type="checkbox"
            checked={useCompression}
            onChange={(e) => setUseCompression(e.target.checked)}
          />
          {' '}Use compression (QR-friendly, smaller URL)
        </label>
      </div>

      <textarea
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder="Paste your FTMS race data JSON here"
        rows={10}
        style={{
          width: '100%',
          background: '#1e1e1e',
          color: '#a9b1d6',
          border: '1px solid #303030',
          borderRadius: '8px',
          padding: '1rem',
          fontFamily: 'monospace',
          resize: 'vertical',
          boxSizing: 'border-box'
        }}
      />
      <button
        onClick={generateUrl}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: '#00d4ff',
          color: '#1a1a2e',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Generate URL
      </button>
      {encodedUrl && (
        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8892b0' }}>
            {useCompression ? 'QR-Friendly Link (compressed):' : 'Standard Link (uncompressed):'}
          </label>
          <input
            type="text"
            readOnly
            value={encodedUrl}
            onClick={(e) => e.target.select()}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#1e1e1e',
              color: '#00d4ff',
              border: '1px solid #303030',
              borderRadius: '8px',
              fontFamily: 'monospace',
              boxSizing: 'border-box'
            }}
          />
          {useCompression && (
            <p style={{ fontSize: '0.875rem', color: '#8892b0', marginTop: '0.5rem' }}>
              This compressed URL uses gzip encoding and will be much shorter - perfect for QR codes!
            </p>
          )}
          <p style={{ fontSize: '0.875rem', color: '#8892b0', marginTop: '0.5rem' }}>
            Copy this link and share it. The data will be loaded into the global variable
            <code>window.ftmsRaceData</code>
          </p>
        </div>
      )}
    </div>
  )
}

export default UrlGenerator
