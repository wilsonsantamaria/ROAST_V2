import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import LogoRoast from './LogoRoast.jsx'
import sonidoCafe from '../assets/audios/sonido-coffe.mp3'

const DURACION_SEGUNDOS = 4
const INTERVALO_MS = 100 // cada 0.1 segundos

function PantallaCarga({ onTerminar }) {
  const [porcentaje, setPorcentaje] = useState(0)
  const audioRef = useRef(null)
  const logoRef = useRef(null)

  // Carga de 0 a 100
  useEffect(() => {
    const audio = audioRef.current
    const incremento = 100 / ((DURACION_SEGUNDOS * 1000) / INTERVALO_MS)
    let actual = 0

    const timer = setInterval(() => {
      actual += incremento

      if (actual >= 100) {
        actual = 100
        clearInterval(timer)
        audio.pause()
        audio.currentTime = 0
        onTerminar()
      }

      setPorcentaje(actual)
    }, INTERVALO_MS)

    return () => clearInterval(timer)
  }, [onTerminar])

  // Audio de la pantalla de carga
  useEffect(() => {
    const audio = audioRef.current
    let activo = true

    function alPrimerClic() {
      if (activo) audio.play()
    }

    audio.play().catch(() => {
      // si el navegador lo bloquea, suena en el primer clic
      document.addEventListener('click', alPrimerClic, { once: true })
    })

    return () => {
      activo = false
      document.removeEventListener('click', alPrimerClic)
      audio.pause()
    }
  }, [])

  // Aparición de las letras de ROAST, una tras otra
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('img', {
        opacity: 0,
        y: 15,
        duration: 0.5,
        stagger: 0.5,
      })
    }, logoRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="flex flex-col items-center gap-7.5">
      <audio src={sonidoCafe} ref={audioRef} />

      <LogoRoast ref={logoRef} />

      <div className="h-[25px] w-[500px] rounded-[15px] border-2 border-tostado">
        <div
          className="h-full rounded-[10px] bg-[url(../assets/img/Grano-Oscuro-removebg-preview.png)] bg-size-[auto_100%] bg-repeat-x transition-[width] duration-100 ease-linear"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <div>
        <p className="text-white">Simulador de tueste de café</p>
      </div>

      <p className="text-white">
        Cargando <span>{Math.round(porcentaje)}%</span>
      </p>
    </div>
  )
}

export default PantallaCarga
