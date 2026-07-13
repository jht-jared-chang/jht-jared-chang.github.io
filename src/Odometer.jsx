import { useState, useEffect } from 'react'

function Odometer({ value }) {
  const valueStr = String(value)
  const [displayChars, setDisplayChars] = useState([])
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    setAnimationComplete(false)
    
    // Initialize with offset digits
    const offset = 5
    const chars = valueStr.split('').map((digit) => {
      if (/\d/.test(digit)) {
        const targetNum = parseInt(digit)
        const offsetNum = (targetNum - offset + 10) % 10
        return String(offsetNum)
      }
      return digit
    })
    setDisplayChars(chars)

    // Set animation complete after all animations finish
    const maxDuration = (0.3 + (valueStr.length - 1) * 0.1) * 1000 + 500
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, maxDuration)

    return () => clearTimeout(timer)
  }, [valueStr])

  // After animation, just return plain text
  if (animationComplete) {
    return <span className="odometer">{valueStr}</span>
  }

  const renderCharacter = (currentChar, targetChar, idx) => {
    const animationDuration = 0.3 + idx * 0.1
    const animationDelay = idx * 0.08

    if (!/\d/.test(targetChar)) {
      return <span key={idx}>{targetChar}</span>
    }

    const current = parseInt(currentChar)
    const target = parseInt(targetChar)
    const distance = (target - current + 10) % 10

    // Build scroll list with exact number of items
    let scrollList = []
    for (let i = 0; i <= distance; i++) {
      scrollList.push(String((current + i) % 10))
    }

    // Calculate exact offset: (distance * line-height)
    const offsetEm = distance

    return (
      <span
        key={idx}
        className="odometer-char"
        style={{
          '--char-count': scrollList.length,
          '--offset-em': offsetEm,
          '--animation-duration': `${animationDuration}s`,
          '--animation-delay': `${animationDelay}s`
        }}
      >
        <span className="odometer-char-inner">
          {scrollList.map((digit, i) => (
            <div key={i} className="odometer-digit">{digit}</div>
          ))}
        </span>
      </span>
    )
  }

  return (
    <span className="odometer">
      {displayChars.map((char, idx) => renderCharacter(char, valueStr[idx], idx))}
    </span>
  )
}

export default Odometer
