import { useEffect, useRef, useState } from 'react'

const DURACION_MS = 4000

// Fondo animado de chispas. Dura 4 segundos y luego desaparece.
function Chispas() {
  const canvasRef = useRef(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let chispas = []
    let idAnimacion
    const tiempoInicio = performance.now()

    function animar(t) {
      // estela oscura
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(20, 10, 0, 0.25)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 4; i++) {
        chispas.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 1.5, // velocidad horizontal
          vy: -(Math.random() * 3 + 1.5), // velocidad vertical hacia arriba
          r: Math.random() * 4 + 2, // radio inicial de la chispa
          h: 10 + Math.random() * 30, // tono de color (matiz)
        })
      }

      chispas = chispas.filter((c) => {
        c.x += c.vx
        c.y += c.vy
        c.r -= 0.05
        if (c.r <= 0) return false
        ctx.beginPath()
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${c.h}, 100%, 55%, 0.8)`
        ctx.fill()
        return true
      })

      if (t - tiempoInicio < DURACION_MS) {
        idAnimacion = requestAnimationFrame(animar)
      } else {
        setVisible(false)
      }
    }

    idAnimacion = requestAnimationFrame(animar)

    return () => cancelAnimationFrame(idAnimacion)
  }, [])

  if (!visible) return null

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: -1 }}
    />
  )
}

export default Chispas
