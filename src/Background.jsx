import { useEffect, useRef } from 'react'
import p5 from 'p5'

function Background() {
  const containerRef = useRef(null)
  const p5Instance = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sketch = (p) => {
      let particles = []
      const particleCount = 30

      p.setup = function() {
        const container = containerRef.current
        if (!container) return

        p.createCanvas(container.clientWidth, container.clientHeight)
        p.background(0,0,0)

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-0.2, 0.2),
            vy: p.random(-0.2, 0.2),
            size: 2,
            opacity: 150
          })
        }
      }

      p.draw = function() {
        // Dark semi-transparent background
        p.background(0,0,0,15)

        // Update particles
        particles.forEach((particle) => {
          particle.x += particle.vx
          particle.y += particle.vy

          // Wrap around edges
          if (particle.x < 0) particle.x = p.width
          if (particle.x > p.width) particle.x = 0
          if (particle.y < 0) particle.y = p.height
          if (particle.y > p.height) particle.y = 0
        })

        // Draw triangles formed by 3 connected particles
        p.noStroke()
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            for (let k = j + 1; k < particles.length; k++) {
              const p1 = particles[i]
              const p2 = particles[j]
              const p3 = particles[k]

              // Check if particles form a reasonable triangle (not too spread out)
              const d12 = p.dist(p1.x, p1.y, p2.x, p2.y)
              const d23 = p.dist(p2.x, p2.y, p3.x, p3.y)
              const d13 = p.dist(p1.x, p1.y, p3.x, p3.y)
              
              if (d12 < 150 && d23 < 150 && d13 < 150) {
                const alpha = p.map(d12 + d23 + d13, 0, width, 80, 10)
                p.fill(0, 212, 255, alpha)
                p.beginShape(p.TRIANGLES)
                p.vertex(p1.x, p1.y)
                p.vertex(p2.x, p2.y)
                p.vertex(p3.x, p3.y)
                p.endShape()
              }
            }
          }
        }
      }

      p.windowResized = function() {
        if (containerRef.current && p.width !== containerRef.current.clientWidth) {
          p.resizeCanvas(containerRef.current.clientWidth, containerRef.current.clientHeight)
        }
      }
    }

    p5Instance.current = new p5(sketch, containerRef.current)

    return () => {
      p5Instance.current?.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'black'
      }}
    />
  )
}

export default Background
